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
  takeCardAnimation = false;
  currentCard = '';
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
      .then(game => console.log(game));
      /*
      this.games$.subscribe((newGameUpdate: any) => {
        console.log('Game update', newGameUpdate)
        this.game.currentPlayer = newGameUpdate.currentPlayer;
        this.game.playedCards = newGameUpdate.playedCards;
        this.game.players = newGameUpdate.players;
        this.game.stack = newGameUpdate.stack;
      });*/
    })
  }

  newGame() {
    this.game = new Game();
    //const coll = collection(this.firestore, 'games');
    //setDoc(doc(coll), {game: this.game.toJson()})
  }

  takeCard() {
    if (!this.takeCardAnimation) {
      this.currentCard = this.game.stack.pop();
      this.takeCardAnimation = true;
      this.game.playedCards.push(this.currentCard);

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;

      setTimeout(() => {
        this.takeCardAnimation = false;
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
    const gi = doc(coll, this.gameId);
    await updateDoc(gi, {
      update: this.game.toJson()
    });
  }
}
