import React from 'react';
import './Jogo.css';


const P: string[] = ["飛", "角", "金", "銀", "桂", "香", "歩", "玉", "竜", "馬", "", "全", "圭", "杏", "と", ""];
const L: string[] = ["r", "b", "g", "s", "n", "l", "p", "k", "d", "c", "", "t", "o", "m", "q", ""];
const B: string[] = ["r", "b", "g", "s", "n", "l", "p", "R", "B", "G", "S", "N", "L", "P"];
const Bsize: number = 9;
//const first_board: string = "lnsgkgsnl1r5b1ppppppppp999PPPPPPPPP1B5R1LNSGKGSNL";
const first_board: string = "k899999998K";

interface IProps_Piece {
  value: string
  number: number
  className: string
}
interface IState_Piece {
}
class Piece extends React.Component<IProps_Piece, IState_Piece> {
  render() {
    return (
      this.props.number === 0 ?
        <span className="piece-box"></span>
        :
        <span className="piece-box">
          <span className={this.props.className}>
            {P[L.indexOf(this.props.value.toLowerCase())]}
          </span>
          <span className={this.props.className.replace("piece", "piece-wrap")}>
            {P[L.indexOf(this.props.value.toLowerCase())]}
          </span>
          {this.props.number > 1 && <span className="bank_number">{this.props.number}</span>}
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
  number: number
  onClick: () => void
}
interface IState_Square {
}
class Square extends React.Component<IProps_Square, IState_Square> {
  render() {
    let class_string: string = "square";
    let class_piece: string = "";
    if (this.props.value !== "") {
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
    if (["d", "c", "t", "o", "m", "q"].indexOf(this.props.value.toLowerCase()) > -1) {
      class_string = class_string + " promoted";
    }
    return (
      <button className={class_string} onClick={this.props.onClick}>
        {/* <span className='black_force'>  {this.props.black_force}</span> */}
        {/* <span className='white_force'>{this.props.white_force}</span> */}
        {/* <span className='black_control'>{this.props.black_control}</span> */}
        {/* <span className='white_control'>{this.props.white_control}</span> */}
        <Piece className={class_piece} value={this.props.value} number={this.props.number} />
      </button>
    )
  }
}

interface IProps_Board {
}
interface IState_Board {
  is_checked: boolean
  is_checked_mate: boolean
  squares: string[]
  selected: number
  selected_bank: number
  turn_black: boolean
  square_banck: number[]
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
      is_checked: false,
      is_checked_mate: false,
      squares: this.first_board(),
      selected: -1,
      selected_bank: -1,
      turn_black: true,
      can_control: [],
      square_banck: Array(B.length).fill(5),
      black_control: Array(Bsize * Bsize).fill(0),
      white_control: Array(Bsize * Bsize).fill(0),
      black_force: Array(Bsize * Bsize).fill(0),
      white_force: Array(Bsize * Bsize).fill(0),
    };

  }

  teste = () => { }
  first_board() {
    const squares = Array(Bsize * Bsize).fill("");
    let square_num: number = 0;

    first_board.split("").forEach((x: string) => {
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
    // ASCII ; A 65 - Z 90 ; a 97 - z 122 ; 0 48 - 9 57
    let code = s.charCodeAt(0);
    return (isNaN(code) || code < 91 ? true : false)
  }

  promote_piece(n: number, selected: number, squares: string[]): string {
    let y: number = Math.trunc(n / Bsize);
    let s: number = Math.trunc(selected / Bsize);
    let yy: number = this.state.turn_black ? y : Bsize - y - 1;
    let ss: number = this.state.turn_black ? s : Bsize - s - 1;

    let piece = squares[selected].toLowerCase();
    if (["r", "b", "s", "n", "l", "p"].indexOf(piece) > -1) {
      let promoted = L[(L.length / 2) + L.indexOf(piece)]
      if (this.state.turn_black) promoted = promoted.toUpperCase();

      if (["p", "l"].indexOf(piece) > -1 && yy === 0) {
        return promoted;
      } else if (piece === "n" && yy < 2) {
        return promoted;
      } else if (["r", "b", "s", "n", "l", "p"].indexOf(piece) > -1 && (ss < 3 || yy < 3) && window.confirm("PROMOTE?")) {
        return promoted;
      }
    }
    return squares[selected];
  }

  handleClick(i: number): void {
    const squares = this.state.squares.slice();
    const square_banck = this.state.square_banck.slice();
    if (this.state.can_control.indexOf(i) > -1) {
      // MOVE Piece
      if (this.state.selected > -1) {
        if (squares[i] !== "") {
          let piece = squares[i].toLowerCase();
          if (["d", "c", "t", "o", "m", "q"].indexOf(piece) > -1) {
            piece = L[(L.indexOf(piece) - (L.length / 2))];
          }

          if (this.is_black(squares[this.state.selected])) {
            ++square_banck[B.indexOf(piece.toUpperCase())];
          } else {
            ++square_banck[B.indexOf(piece.toLowerCase())];
          }
        }

        squares[i] = this.promote_piece(i, this.state.selected, squares);
        squares[this.state.selected] = "";
        //PUT Piece
      } else if (this.state.selected_bank > -1) {
        --square_banck[this.state.selected_bank];
        squares[i] = B[this.state.selected_bank];
      }

      let cf = this.set_control_force(squares);
      let king = squares.indexOf(this.state.turn_black ? "k" : "K");
      let control = (this.state.turn_black ? cf.black_control : cf.white_control);
      let is_checked = false;
      let is_checked_mate = false;
      if (control[king] > 0) {
        is_checked = true;
        if (this.check_checkmate(squares)) {
          is_checked_mate = true;
          alert("Check Mate!")
        } else {
          alert("Check!")
        }
      }

      this.setState(this.set_control_force(squares));
      this.setState({
        squares: squares,
        is_checked: is_checked,
        is_checked_mate: is_checked_mate,
        square_banck: square_banck,
        selected_bank: -1,
        selected: -1,
        turn_black: !this.state.turn_black,
        can_control: []
      });
    } else if (squares[i] !== "" && this.is_black(squares[i]) === this.state.turn_black) {


      this.setState({
        selected: i,
        selected_bank: -1,
        can_control: this.can_control_checked(squares, i, this.can_control(i, true, true, squares), true, this.state.turn_black),
      });
    } else {
      this.setState({
        selected: -1,
        selected_bank: -1,
        can_control: []
      });
    }
    //this.setState(this.set_control_force(squares));
  }

  check_checkmate(squares: string[]): boolean {
    let checkmate: boolean = true;
    let black: number[] = [];
    let white: number[] = [];
    let black_bank: number[] = [];
    let white_bank: number[] = [];

    squares.forEach((x, i) => {
      if (x !== "") {
        if (this.is_black(x)) {
          black.push(i);
        } else {
          white.push(i)
        }
      }
    });

    this.state.square_banck.forEach((x, i) => {
      if (x > 0) {
        if (this.is_black(B[i])) {
          black_bank.push(i);
        } else {
          white_bank.push(i)
        }
      }
    });

    let control = (this.state.turn_black ? white : black);
    let bank = (this.state.turn_black ? white_bank : black_bank);
    let cf = this.set_control_force(squares);
    let reforce = (this.state.turn_black ? cf.black_control : cf.white_control);
    control.forEach((i) => {
      if ((this.can_control_checked(squares, i, this.can_control(i, true, true, squares, reforce), true, !this.state.turn_black,)).length > 0) {
        checkmate = false
      }
    });
    bank.forEach((i) => {
      if ((this.can_control_checked(squares, i, this.can_position(i, squares), false, !this.state.turn_black)).length > 0) {
        checkmate = false
      }
    })
    return checkmate;
  }

  can_control_checked(squares: string[], i: number, temp_control: number[],
    in_board: boolean = true, isblak: boolean = true
  ): number[] {
    let can_control: number[] = [];

    temp_control.forEach((f: number) => {
      let future = squares.slice();
      if (in_board) {
        future[f] = future[i];
        future[i] = "";
      } else {
        future[f] = B[i];
      }
      let cf = this.set_control_force(future);
      let king = future.indexOf(isblak ? "K" : "k");
      let control = (isblak ? cf.white_control : cf.black_control);
      if (control[king] === 0) {
        can_control.push(f);
      }
    });
    return can_control;
  }

  componentDidMount() {
    this.setState(this.set_control_force(this.state.squares));
  }

  componentDidUpdate(prevProps: IProps_Board, prevState: IState_Board) {
  }

  handleClickBank(i: number): void {
    if (this.state.square_banck[i] > 0 && this.is_black(B[i]) === this.state.turn_black) {
      this.setState({ selected_bank: i, selected: -1, });
      this.setState({ can_control: this.can_control_checked(this.state.squares, i, this.can_position(i, this.state.squares), false, this.state.turn_black) });
    } else {
      this.setState({
        selected_bank: -1,
        selected: -1,
        can_control: []
      });
    }

  }

  set_control_force(squares: string[]) {
    //let squares = this.state.squares.slice();
    let black_control = Array(Bsize * Bsize).fill(0);
    let white_control = Array(Bsize * Bsize).fill(0);
    let black_force = Array(Bsize * Bsize).fill(0);
    let white_force = Array(Bsize * Bsize).fill(0);

    let control: number[] = [];
    let forces: number[] = [];
    let kings: number[] = [];
    squares.forEach((s: string, i: number) => {
      if (s.toLowerCase() === "k") {
        kings.push(i);
      } else if (s !== "") {
        control = this.can_control(i, true, false, squares);
        forces = this.can_control(i, false, false, squares);
        if (this.is_black(s)) {
          control.forEach((c: number) => { ++black_control[c] })
          forces.forEach((f: number) => { ++black_force[f] })
        } else {
          control.forEach((c: number) => { ++white_control[c] })
          forces.forEach((f: number) => { ++white_force[f] })
        }
      }
    });
    kings.forEach((i: number) => {
      let reforce = (this.is_black(squares[i]) ? white_control : black_control);
      control = this.can_control(i, true, false, squares, reforce);
      forces = this.can_control(i, false, false, squares);
      if (this.is_black(squares[i])) {
        control.forEach((c: number) => { ++black_control[c] })
        forces.forEach((f: number) => { ++black_force[f] })
      } else {
        control.forEach((c: number) => { ++white_control[c] })
        forces.forEach((f: number) => { ++white_force[f] })
      }
    });
    return {
      black_control: black_control,
      black_force: black_force,
      white_control: white_control,
      white_force: white_force
    };
  }

  can_control(n: number, limit: boolean = true, move: boolean = true, squares: string[] = [], reforce: number[] = []): number[] {
    //let squares = this.state.squares.slice();
    let piece = squares[n].toLowerCase();
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

    let _reforce = reforce;
    if (reforce.length === 0) {
      if (this.is_black(squares[n])) {
        _reforce = this.state.white_control;
      } else {
        _reforce = this.state.black_control;
      }
    }
    for (let i = 0; i < dx.length; ++i) {
      let xx = (turn_black ? x + dx[i] : x - dx[i]);
      let yy = (turn_black ? y + dy[i] : y - dy[i]);
      if (0 <= xx && xx < Bsize && 0 <= yy && yy < Bsize) {
        let num = (xx + (yy * Bsize));
        if (!limit || (squares[num] === "" || turn_black !== this.is_black(squares[num]))) {
          if (piece === "k") {
            if (_reforce[num] === 0)
              can_control.push(num);
          } else {
            can_control.push(num);
          }
        } else if (!move && turn_black === this.is_black(squares[num])) {
          can_control.push(num);
        }
      }
    }

    // Move n steps
    for (let i = 0; i < nx.length; ++i) {
      let xx = (turn_black ? x + nx[i] : x - nx[i]);
      let yy = (turn_black ? y + ny[i] : y - ny[i]);
      while (0 <= xx && xx < Bsize && 0 <= yy && yy < Bsize) {
        let num = (xx + (yy * Bsize));
        if (!limit || (squares[num] === "" || turn_black !== this.is_black(squares[num]))) {
          can_control.push(num);
        } else if (!move && turn_black === this.is_black(squares[num])) {
          can_control.push(num);
        }
        if (limit && squares[num] !== "")
          break;
        xx = (turn_black ? xx + nx[i] : xx - nx[i]);
        yy = (turn_black ? yy + ny[i] : yy - ny[i]);
      }
    }


    return can_control.slice();
  }

  fu_check_mate(n: number, squares: string[]) {
    //let squares = this.state.squares;
    let x: number = n % Bsize;
    let y: number = Math.trunc(n / Bsize);
    let yy = (this.state.turn_black ? y - 1 : y + 1);
    let k = (this.state.turn_black ? "k" : "K");
    let king = x + (yy * Bsize);
    let reforce = (this.state.turn_black ? this.state.white_control : this.state.black_control);
    if (squares[king] === k) {
      let king_control = this.can_control(king, true, true, squares);
      if (king_control.length > 0) {
        return false;
      } else if (reforce[n] > 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  can_position(n: number, squares: string[]) {
    //let squares = this.state.squares;
    let turn_black = this.state.turn_black;
    let all_free: number[] = [];

    if (B[n].toLowerCase() === "p") {
      let not_position: number[] = [];
      squares.forEach((p, i) => {
        if (B[n] === p) not_position.push(i % Bsize);
      });

      squares.forEach((p, i) => {
        let y: number = Math.trunc(i / Bsize);
        let yy = (turn_black ? y : (Bsize - 1) - y);

        if (p === "") {
          if (
            yy !== 0 &&
            not_position.indexOf(i % Bsize) === -1 &&
            this.fu_check_mate(i, squares) === false
          ) {
            all_free.push(i);
          }
        }
      });
    } else if (B[n].toLowerCase() === "n") {
      squares.forEach((p, i) => {
        let y: number = Math.trunc(i / Bsize);
        let yy = (turn_black ? y : (Bsize - 1) - y);

        if (p === "") {
          if (yy !== 0 && yy !== 1) {
            all_free.push(i);
          }
        }
      });
    } else if (B[n].toLowerCase() === "l") {
      squares.forEach((p, i) => {
        let y: number = Math.trunc(i / Bsize);
        let yy = (turn_black ? y : (Bsize - 1) - y);

        if (p === "") {
          if (yy !== 0) {
            all_free.push(i);
          }
        }
      });
    } else {
      squares.forEach((p, i) => {
        if (p === "") all_free.push(i);
      });
    }
    return all_free;
  }

  renderSquare(i: number) {
    return (
      <Square
        number={1}
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
  renderBankSquare(i: number, n: number, is_black: boolean) {
    return (
      <Square
        number={n}
        is_clicked={(this.state.selected_bank === i)}
        is_black={is_black}
        can_control={false}
        value={B[i]}
        black_control={0}
        white_control={0}
        black_force={0}
        white_force={0}
        onClick={() => { this.handleClickBank(i) }}
      />
    )
  }


  render() {
    let linha = new Array<JSX.Element>();
    let coluna = new Array<JSX.Element>();
    let white_bank = new Array<JSX.Element>();
    let black_bank = new Array<JSX.Element>();
    B.forEach((p: string, i: number) => {
      if (this.is_black(p)) {
        black_bank = black_bank.concat(this.renderBankSquare(i, this.state.square_banck[i], true));
      } else {
        white_bank = white_bank.concat(this.renderBankSquare(i, this.state.square_banck[i], false));
      }
    });
    for (let i = 0; i < (Bsize * Bsize); i++) {
      let x: number = i % Bsize;
      //let y: number = Math.trunc(i / Bsize);

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