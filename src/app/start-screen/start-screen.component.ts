import { Component, OnInit } from '@angular/core';
import { addDoc, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { collection, setDoc } from '@firebase/firestore';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {

  constructor(private firestore: Firestore, private router: Router) { }

  ngOnInit(): void {
  }

  async newGame() {
    //start game
    let game = new Game();
    const coll = collection(this.firestore, 'games');
    const docRef = await addDoc(coll,{game: game.toJson()} );
    console.log('Document ID ', docRef.id);
    this.router.navigateByUrl('/game/' + docRef.id);
    getDoc(doc(coll, docRef.id));
    
    /*
    setDoc(doc(coll), {game: game.toJson()})
    .then((gameInfo: any) => {
      console.log(gameInfo);
    })
   */ 
  }
}
