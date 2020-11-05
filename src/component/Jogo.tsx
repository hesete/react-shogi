import React from 'react';
import './Jogo.css';


const P: string[] = ["飛", "角", "金", "銀", "桂", "香", "歩", "玉", "竜", "馬", "", "全", "圭", "杏", "と", ""];
const L: string[] = ["r", "b", "g", "s", "n", "l", "p", "k", "d", "c", "", "t", "o", "m", "q", ""];
const B: string[] = ["r", "b", "g", "s", "n", "l", "p"];
const Bsize: number = 9;
const first_board: string = "lnsgkgsnl1r5b1ppppppppp999PPPPPPPPP1B5R1LNSGKGSNL";

interface IProps_Piece {
  value: string
  className: string
}
interface IState_Piece {
}
class Piece extends React.Component<IProps_Piece, IState_Piece> {
  render() {
    return (
      <span className="piece-box">
        <span className={this.props.className}>
          {P[L.indexOf(this.props.value.toLowerCase())]}
        </span>
        <span className={this.props.className.replace("piece", "piece-wrap")}>
        {P[L.indexOf(this.props.value.toLowerCase())]}
        </span>
      </span>
    )
  }
}
interface IProps_Square {
  value: string
  is_clicked: boolean
  can_control: boolean
  is_black: boolean
  black_control: number
  white_control: number
  black_force: number
  white_force: number
  onClick: () => void
}
interface IState_Square {
}
class Square extends React.Component<IProps_Square, IState_Square> {
  render() {
    let class_string: string = "square";
    let class_piece: string = "";
    if (this.props.value != "") {
      class_piece = class_piece + " piece";
    }
    if (this.props.is_black) {
      class_piece = class_piece + " black";
    } else {
      class_piece = class_piece + " white";
    }
    if (this.props.is_clicked) {
      class_string = class_string + " click";
    }
    if (this.props.can_control) {
      class_string = class_string + " attack";
    }
    return (
      <button className={class_string} onClick={this.props.onClick}>
        {/* <span className='black_force'>  {this.props.black_force}</span> */}
        {/* <span className='white_force'>{this.props.white_force}</span> */}
        {/* <span className='black_control'>{this.props.black_control}</span> */}
        {/* <span className='white_control'>{this.props.white_control}</span> */}
        <Piece className={class_piece} value={this.props.value} />
      </button>
    )
  }
}

interface IProps_Board {
}
interface IState_Board {
  squares: string[]
  selected: number
  turn_black: boolean
  black_banck:number[]
  white_banck:number[]
  can_control: number[]
  black_control: number[]
  white_control: number[]
  black_force: number[]
  white_force: number[]
}
class Board extends React.Component<IProps_Board, IState_Board> {
  constructor(props: IProps_Board) {
    super(props);
    this.state = {
      squares: this.first_board(),
      selected: -1,
      turn_black: true,
      can_control: [],
      black_banck: Array(B.length).fill(0),
      white_banck: Array(B.length).fill(0),
      black_control: Array(Bsize * Bsize).fill(0),
      white_control: Array(Bsize * Bsize).fill(0),
      black_force: Array(Bsize * Bsize).fill(0),
      white_force: Array(Bsize * Bsize).fill(0),
    };
    this.set_control_force();
  }

  first_board() {
    const squares = Array(Bsize * Bsize).fill("");
    let square_num: number = 0;

    first_board.split("").map((x: string) => {
      let c = Number.parseInt(x);
      if (!isNaN(c)) {
        for (let z = c; z > 0; z--) { squares[square_num++] = ""; }
      } else {
        squares[square_num++] = x;
      }
    });
    return squares;
  }

  is_black(s: string): boolean {
    // ASCII
    // A 65 - Z 90
    // a 97 - z 122
    // 0 48 - 9 57

    let code = s.charCodeAt(0);
    return (isNaN(code) || code < 91 ? true : false)
  }

  handleClick(i: number): void {
    const squares = this.state.squares.slice();
    if (this.state.selected === -1) {
      // SELECT Piece
      if (squares[i] !== "" &&
        this.is_black(squares[i]) === this.state.turn_black
      ) {
        this.setState({ selected: i });
        this.setState({ can_control: this.can_control(i) });

      }
    } else {
      // MOVE Piece
      if (this.state.can_control.indexOf(i) > -1) {
        squares[i] = squares[this.state.selected];
        squares[this.state.selected] = "";
        this.setState({
          squares: squares,
          selected: -1,
          turn_black: !this.state.turn_black,
          can_control: []
        });
      } else {
        this.setState({
          selected: -1,
          can_control: []
        });
      }
    }
    this.set_control_force();
  }

  set_control_force() {
    let squares = this.state.squares;
    let black_control = Array(Bsize * Bsize).fill(0);
    let white_control = Array(Bsize * Bsize).fill(0);
    let black_force = Array(Bsize * Bsize).fill(0);
    let white_force = Array(Bsize * Bsize).fill(0);

    let control: number[] = [];
    let forces: number[] = [];
    let is_black: boolean = true;
    squares.map((s: string, i: number) => {
      if (s !== "") {
        control = this.can_control(i);
        forces = this.can_control(i, false);
        is_black = this.is_black(s);
        if (is_black) {
          control.map((c: number) => { ++black_control[c] })
          forces.map((f: number) => { ++black_force[f] })
        } else {
          control.map((c: number) => { ++white_control[c] })
          forces.map((f: number) => { ++white_force[f] })
        }
      }
    });
    this.setState({
      black_control: black_control,
      black_force: black_force,
      white_control: white_control,
      white_force: white_force
    })
  }

  can_control(n: number, limit: boolean = true): number[] {
    let squares = this.state.squares;
    let piece = this.state.squares[n].toLowerCase();
    let turn_black = this.is_black(squares[n]);
    let can_control: number[] = [];
    let x: number = n % Bsize;
    let y: number = Math.trunc(n / Bsize);
    let dx: number[] = [];
    let dy: number[] = [];
    let nx: number[] = [];
    let ny: number[] = [];

    //"飛", "角","金","銀","桂","香","歩","玉", "竜","馬","","全","圭","杏","と"
    //"r" , "b", "g", "s", "n", "l", "p", "k", "d", "c","", "t", "o", "m", "q"      

    if (["g", "t", "o", "m", "q"].indexOf(piece) > -1) {
      dx = [-1, 0, 1, 1, 0, -1];
      dy = [-1, -1, -1, 0, 1, 0];
    } else if (piece === "p") {
      dx = [0];
      dy = [-1];
    } else if (piece === "n") {
      dx = [-1, 1];
      dy = [-2, -2];
    } else if (piece === "s") {
      dx = [-1, 0, 1, -1, 1];
      dy = [-1, -1, -1, 1, 1];
    } else if (["k", "d", "c"].indexOf(piece) > -1) {
      dx = [-1, 0, 1, 1, 1, 0, -1, -1];
      dy = [-1, -1, -1, 0, 1, 1, 1, 0];
    }

    if (piece === "l") {
      nx = [0];
      ny = [-1];
    } else if (["b", "c"].indexOf(piece) > -1) {
      nx = [-1, 1, 1, -1];
      ny = [-1, -1, 1, 1];
    } else if (["r", "d"].indexOf(piece) > -1) {
      nx = [0, 1, 0, -1];
      ny = [-1, 0, 1, 0];
    }

    // Move 1 stem
    for (let i = 0; i < dx.length; ++i) {
      let xx = (turn_black ? x + dx[i] : x - dx[i]);
      let yy = (turn_black ? y + dy[i] : y - dy[i]);
      if (0 <= xx && xx < Bsize && 0 <= yy && yy < Bsize) {
        let num = (xx + (yy * Bsize));
        if (!limit || (squares[num] === "" || turn_black !== this.is_black(squares[num])))
          can_control.push(num);
      }
    }

    // Move n steps
    for (let i = 0; i < nx.length; ++i) {
      let xx = (turn_black ? x + nx[i] : x - nx[i]);
      let yy = (turn_black ? y + ny[i] : y - ny[i]);
      while (0 <= xx && xx < Bsize && 0 <= yy && yy < Bsize) {
        let num = (xx + (yy * Bsize));
        if (!limit || (squares[num] === "" || turn_black !== this.is_black(squares[num])))
          can_control.push(num);
        if (limit && squares[num] != "")
          break;
        xx = (turn_black ? xx + nx[i] : xx - nx[i]);
        yy = (turn_black ? yy + ny[i] : yy - ny[i]);
      }
    }


    return can_control;
  }

  renderSquare(i: number) {
    return (
      <Square
        is_clicked={(this.state.selected === i)}
        is_black={this.is_black(this.state.squares[i])}
        can_control={(this.state.can_control.indexOf(i) > -1)}
        value={this.state.squares[i]}
        black_control={this.state.black_control[i]}
        white_control={this.state.white_control[i]}
        black_force={this.state.black_force[i]}
        white_force={this.state.white_force[i]}
        onClick={() => { this.handleClick(i) }}
      />
    )
  }
  renderBankSquare(p:string,black:boolean) {
    return (
      <Square
        is_clicked={false}
        is_black={black}
        can_control={false}
        value={p}
        black_control={0}
        white_control={0}
        black_force={0}
        white_force={0}
        onClick={() => { alert(p) }}
      />
    )
  }


  render() {
    let linha = new Array<JSX.Element>();
    let coluna = new Array<JSX.Element>();
    let white_bank = new Array<JSX.Element>();
    let black_bank = new Array<JSX.Element>();
    B.map((p:string,i:number)=>{
      let code = p.charCodeAt(0);
      
    });
    for (let i = 0; i < (Bsize * Bsize); i++) {
      let x: number = i % Bsize;
      let y: number = Math.trunc(i / Bsize);

      coluna = coluna.concat(this.renderSquare(i));
      if (x === (Bsize - 1)) {
        linha = linha.concat(<div className="board-row"> {coluna.slice()} </div>);
        coluna = new Array<JSX.Element>();
      }
    }

    return (
      <div>
        <div className="white_bank">{white_bank}</div>
        {linha}
        <div className="black_bank">{black_bank}</div>
      </div>
    );
  }
}

interface IProps_Game {
}
interface IState_Game {
}
class Game extends React.Component<IProps_Game, IState_Game> {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div></div>
          <ol></ol>
        </div>
      </div>
    );
  }
}

export default Game;