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


      //this.getDoc();
      const coll = collection(this.firestore, 'games');
      this.game$ = collectionData(coll,this.gameId)
      this.game$.subscribe( ( newGame: any) => {
        console.log('game update', newGame);
        this.game = newGame;
        this.game.currentPlayer = newGame.currentPlayer;
        this.game.playedCards = newGame.playedCards;
        this.game.players = newGame.players;
        this.game.stack = newGame.stack;
        this.game.takeCardAnimation = newGame.takeCardAnimation,
        this.game.currentCard = newGame.currentCard
      });
      //const docSnap = getDoc(doc(coll, this.gameId))
        //.then(game => this.game = new Game())
    })
  }
  /*
    async getDoc() {
      const docRef = doc(this.firestore, 'games',this.gameId);
      const docSnap = await getDoc(docRef);
    }*/

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
        this.saveGame();
      }, 1000);
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
    //this.game$ = collectionData(coll, this.gameId)
    //const docSnap = await getDoc(doc(coll, this.gameId));
    await updateDoc(doc(coll, this.gameId), {
      game: this.game.toJson()
    });
  }
}
