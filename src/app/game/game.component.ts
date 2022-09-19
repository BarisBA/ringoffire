import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { collectionData, doc, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';
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
  games$: Observable<any>;
  gameId;

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private firestore: Firestore) { }

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {
      this.gameId = params['id'];

      const coll = collection(this.firestore, 'games');
      //this.games$ = collectionData(coll);
      
      getDoc(doc(coll, this.gameId))
      .then(games => this.game = new Game());
      
      /*
      this.games$.subscribe((game: any) => {
        console.log('Game update', game)
        this.game.currentPlayer = game.currentPlayer;
        this.game.playedCards = game.playedCards;
        this.game.players = game.players;
        this.game.stack = game.stack;
        this.game.takeCardAnimation = game.takeCardAnimation;
        this.game.currentCard = game.currentCard;
      });*/
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
      this.saveGame();

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;

      setTimeout(() => {
        this.game.takeCardAnimation = false;
        this.saveGame();
      }, 1500);
    }
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

  async saveGame() {
    
    const coll = collection(this.firestore, 'games');
    getDoc(doc(coll, this.gameId));
    await updateDoc(doc(this.firestore, 'games', this.gameId),{
      game: this.game.toJson()
    });
  }
}
