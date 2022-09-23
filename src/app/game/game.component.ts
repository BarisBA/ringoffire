import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { collectionData, doc, Firestore, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collection, setDoc } from '@firebase/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  game: Game;
  game$: Observable<any>;
  gameId;

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private firestore: Firestore) { }

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {
      this.gameId = params['id'];

      const coll = collection(this.firestore, 'games');
      this.game$ = collectionData(coll,this.gameId)
      this.game$.subscribe( ( games: any) => {
        this.getDoc(this.gameId);
        /*
        console.log('game update', games);
        this.game = games;
        this.game.currentPlayer = games.currentPlayer;
        this.game.playedCards = games.playedCards;
        this.game.players = games.players;
        this.game.stack = games.stack;
        this.game.takeCardAnimation = games.takeCardAnimation,
        this.game.currentCard = games.currentCard
        */
      });
    })
    
    
  }
  
    async getDoc(params: any) {
      onSnapshot(doc(this.firestore, 'games', params), (doc) => {
        let data: any = doc.data();
        this.game = data['game'];
        //console.log('Current data', doc.data());
        //console.log(this.game);
      })
    }

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    if (!this.game.takeCardAnimation) {
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
    console.log(this.game.currentPlayer);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent)

    dialogRef.afterClosed().subscribe(name => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.saveGame();
      }
    });
  }

  saveGame() {
    //this.getDoc(this.gameId);
    updateDoc(doc(this.firestore,'games', this.gameId), {
      game: this.game
    });
    //console.log('save');
  }
}
