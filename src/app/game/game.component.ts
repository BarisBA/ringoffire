import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { collectionData, doc, Firestore, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collection, setDoc } from '@firebase/firestore';
import { ActivatedRoute } from '@angular/router';
import { EditPlayerComponent } from '../edit-player/edit-player.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  game: Game;
  game$: Observable<any>;
  gameId;
  gameOver = false;
  playerAdded = false;

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private firestore: Firestore) { }

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {
      this.gameId = params['id'];

      const coll = collection(this.firestore, 'games');
      this.game$ = collectionData(coll,this.gameId)
      this.game$.subscribe( ( games: any) => {
        this.getDoc(this.gameId);
      });
    })
    
    
  }
  
    async getDoc(params: any) {
      onSnapshot(doc(this.firestore, 'games', params), (doc) => {
        let data: any = doc.data();
        this.game = data['game'];
      })
    }

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    if (this.game.stack.length == 0) {
      this.gameOver = true;
    } 
    else if (!this.game.takeCardAnimation) {
      this.game.currentCard = this.game.stack.pop();
      this.game.takeCardAnimation = true;
      this.game.playedCards.push(this.game.currentCard);

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;

      this.saveGame();
      
      setTimeout(() => {
        this.game.takeCardAnimation = false;
      }, 1000);
    }
  }

  editPlayer(playerId) {
    console.log('edit player', playerId);
    
    const dialogRef = this.dialog.open(EditPlayerComponent);
    dialogRef.afterClosed().subscribe((change: string) => {
        if (change == 'DELETE') {
          this.game.players.splice(playerId, 1)
        } 
        this.saveGame;
    })
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent)

    dialogRef.afterClosed().subscribe(name => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.saveGame();
      }
    });
    
    this.playerAdded = true;
  }

  saveGame() {
    //this.getDoc(this.gameId);
    updateDoc(doc(this.firestore,'games', this.gameId), {
      game: this.game
    });
    //console.log('save');
  }
}
