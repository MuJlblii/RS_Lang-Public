import Component from "./Component";
import "../../scss/components/_button.scss";
import Sprint from "../pages/Sprint";

class GameLayout implements Component {
  //   private class: string;
  //   private id: string;
  //   private text: string;

  //   public constructor(options: { class: string; id: string; text: string }) {
  //     this.class = options.class;
  //     this.id = options.id;
  //     this.text = options.text;
  //   }
  public async render(): Promise<string> {
    const view = `
        <div class="game-layout" id="game-layout">
            <img src="./../../assets/svg/close.svg" class="img-close-btn">
            <div class="game-layout__question_wrapper" id="game-layout__question_wrapper">

            </div>
        </div>
    `;
    return view;
  }

  //   public async render(): Promise<string> {
  //     const view = `
  //       <button id="${this.id ? this.id : ""}" class="button
  //       ${this.class ? this.class : ""}">${this.text}</button>
  //     `;
  //     return view;
  //   }

  public async after_render(): Promise<void> {
    const img = document.querySelector('.img-close-btn') as HTMLElement;
    const gameLayout = document.querySelector('.game-layout') as HTMLElement;
    img.onclick = () => {
      gameLayout.remove();
      Sprint.arrayOfQuestions = [];
      Sprint.indexWord = 0;
      Sprint.combo = [];
    };
    return;
  }
}

export default GameLayout;
