import Page from "./Page";
import "../../scss/layout/_audioChallenge.scss";
import { Request } from "../../services/Requests";
import { CardInfo, resultGame } from "../common/interfaceList";
import Utils from "../../services/Utils";

const COUNT_LIFES = 5;

class AudioChallenge implements Page {
  private hearts: number;
  private stateCard: CardInfo[];
  private stateCheck: number[];
  private stateResult: resultGame;
  private counter: number;
  private timer: number;

  constructor() {
    this.timer = 0;
    this.counter = 0;
    this.hearts = 1;
    this.stateCard = [];
    this.stateCheck = [];
    this.stateResult = { goodResult: [], badResult: [] };
  }

  public async render(): Promise<string> {
    const levelEnglish = ["A1", "A2", "B1", "B2", "C1", "C2"];

    let buttons = "";
    const RSLangGroup = localStorage.getItem("rslang_current_group") as string;
    levelEnglish.forEach((elem, index) => {
      buttons += `
        <li>
          <a class="${
            parseInt(RSLangGroup) < 6
              ? index === parseInt(RSLangGroup)
                ? "button"
                : "button_grey"
              : index === 0
              ? "button"
              : "button_grey"
          }" data-index="${index}" >${elem}</a>
        </li>
      `;
    });

    const view = `
      <section class="section-audiochallenge">
          <h1>Audio Challenge</h1>
      <div class="block_audiochallenge">
        <h3> Listen to the word, then choose the correct option. </h3>
        <a class="start_audiochallenge">
          <img src="./assets/svg/sound-system.svg" alt="audio logo">
          <h4> START GAME </h4>
        </a>
      </div>
      <div class="test-audiochalenge">
      <p> You can change your level </p>
        <ul>
          ${buttons}
        </ul>
      </div>
    </section>
    `;
    return view;
  }

  public async changeBtn() {
    const arrBtn = Array.from(
      document.querySelectorAll(".test-audiochalenge a")
    ) as Array<HTMLElement>;
    arrBtn.forEach((el) => {
      el.onclick = (event: Event) => {
        arrBtn.forEach((item) => {
          item.classList.add("button_grey");
          item.classList.remove("button");
        });
        localStorage.setItem(
          "rslang_current_group",
          el.dataset.index as string
        );
        el.classList.remove("button_grey");
        el.classList.add("button");
      };
    });
  }

  public async startAudioChallenge() {
    const startBtn = document.querySelector(
      ".start_audiochallenge"
    ) as HTMLElement;
    startBtn.onclick = () => {
      const elem = document.createElement("div");
      elem.classList.add("layoutForAudioChallenge");
      const img = new Image();
      img.src = "./assets/svg/close.svg";
      img.classList.add("img-close-btn");
      img.onclick = () => {
        elem.remove();
        document.body.style.overflow = "auto";
        clearTimeout(this.timer);
      };
      elem.append(img);
      const activeBtn = document.querySelector(
        ".test-audiochalenge .button"
      ) as HTMLElement;
      document.querySelector(".main-wrapper")?.append(elem);
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
      this.hearts = COUNT_LIFES;
      this.CreateStateCard(parseInt(activeBtn.dataset.index as string));
    };
  }

  veiwRigthChoose() {
    const sound = document.querySelector(
      ".logo-sound_audio-chellenge"
    ) as HTMLElement;
    const arrTextCards = document.querySelectorAll(
      ".text_audio-chellenge"
    ) as NodeListOf<Element>;
    arrTextCards.forEach((el) => {
      if ((el as HTMLElement).dataset.infoID === sound.dataset.infoID) {
        el.classList.add("right_audio-chellenge");
        this.stateResult.badResult.push(
          this.stateCard[
            this.stateCheck[
              parseInt((el as HTMLElement).dataset.index as string)
            ]
          ]
        );
      } else {
        el.classList.add("false_audio-chellenge");
      }
    });
    setTimeout(() => {
      arrTextCards.forEach((el) => {
        el.classList.remove("right_audio-chellenge");
        el.classList.remove("false_audio-chellenge");
        this.changingBtnDisabled(".text_audio-chellenge", false);
      });
      if (this.hearts === 0) {
        this.renderResult();
      } else {
        this.addLogicForGame();
      }
    }, 1000);
  }

  public async CreateStateCard(num: number) {
    this.clearState();
    const downloadMenu = document.createElement("h2");
    downloadMenu.classList.add("download-info");
    document.querySelector(".layoutForAudioChallenge")?.append(downloadMenu);
    downloadMenu.innerHTML = "DOWNLOADING";
    const interval = setInterval(() => {
      downloadMenu.innerHTML = ">" + downloadMenu.innerHTML + "<";
      if (downloadMenu.innerHTML.length > 30)
        downloadMenu.innerHTML = "DOWNLOADING";
    }, 500);
    for (let i = 0; i < 30; i++) {
      const arrayCards = await Request.getWordsList({ group: num, page: i });
      this.stateCard.push(...arrayCards);
    }
    clearInterval(interval);
    downloadMenu.remove();
    this.createViewAudioChallenge();
    this.drawKeyHelper();
    Utils.shuffleArr(this.stateCard);
    this.addLogicForGame();
    // this.keyDownEventlistenerAdd();
  }

  public startTimer(num = 5) {
    const timer = setTimeout(() => {
      this.minusHeart();
      this.changingBtnDisabled(".text_audio-chellenge");
      this.counter += 1;
      this.veiwRigthChoose();
    }, num * 1000);
    if (typeof timer === "number") {
      this.timer = timer;
    }
    return {
      stopTimer() {
        clearTimeout(timer);
      },
    };
  }

  public addLogicForGame() {
    this.keyDownEventlistenerAdd();
    this.stateCheck = [this.counter];
    if (this.timer) {
      clearTimeout(this.timer);
    }
    const timer = this.startTimer(5);
    const sound = document.querySelector(
      ".logo-sound_audio-chellenge"
    ) as HTMLElement;
    const arrTextCards = document.querySelectorAll(
      ".text_audio-chellenge"
    ) as NodeListOf<Element>;
    sound.dataset.infoID = this.stateCard[this.counter].id;
    this.createAudioFile(this.stateCard[this.counter]).startPlay();
    sound.onclick = () => {
      this.createAudioFile(this.stateCard[this.counter]).audio.play();
    };
    while (this.stateCheck.length < 4) {
      const randomNumber = Utils.getRndInteger(0, 599);
      if (!this.stateCheck.includes(randomNumber)) {
        this.stateCheck.push(randomNumber);
      }
    }
    Utils.shuffleArr(this.stateCheck);
    this.stateCheck.forEach((el, index) => {
      arrTextCards[index].innerHTML = this.stateCard[el].wordTranslate;
      (arrTextCards[index] as HTMLElement).dataset.infoID =
        this.stateCard[el].id;
      (arrTextCards[index] as HTMLElement).dataset.index = index.toString();
      (arrTextCards[index] as HTMLElement).onclick = (event: Event) => {
        const elem = event.target as HTMLElement;
        this.keyDownEventlistenerRemove();
        this.changingBtnDisabled(".text_audio-chellenge");
        if (elem.dataset.infoID === sound.dataset.infoID) {
          elem.classList.add("right_audio-chellenge");
          const position = this.stateCheck.indexOf(this.counter);
          this.stateResult.goodResult.push(
            this.stateCard[this.stateCheck[position]]
          );
        } else {
          elem.classList.add("false_audio-chellenge");
          const position = this.stateCheck.indexOf(this.counter);
          this.stateResult.badResult.push(
            this.stateCard[this.stateCheck[position]]
          );
          arrTextCards[position].classList.add("right_audio-chellenge");
          this.minusHeart();
        }
        timer.stopTimer();
        setTimeout(() => {
          arrTextCards.forEach((el) => {
            el.classList.remove("right_audio-chellenge");
            el.classList.remove("false_audio-chellenge");
            this.changingBtnDisabled(".text_audio-chellenge", false);
          });
          if (this.hearts === 0) {
            console.log(this.stateCheck);
            this.renderResult();
          } else {
            this.addLogicForGame();
          }
        }, 1000);
        this.counter += 1;
      };
    });
  }

  public changingBtnDisabled(str: string, check = true) {
    const arrBtn = document.querySelectorAll(str);
    arrBtn.forEach((el) => {
      if (check) {
        el.classList.add("disabled");
      } else {
        el.classList.remove("disabled");
      }
    });
  }

  public createViewAudioChallenge() {
    const element = document.querySelector(
      ".layoutForAudioChallenge"
    ) as HTMLElement;
    const blockForGame = document.createElement("div");
    blockForGame.classList.add("block-for-game");
    blockForGame.innerHTML += `
    <a class="logo-sound_audio-chellenge"><img src="./assets/svg/volume.svg" alt="logo sound"></a>
    <div class="minor-block_audio-chellenge">
      <a class="text_audio-chellenge"></a>
      <a class="text_audio-chellenge"></a>
      <a class="text_audio-chellenge"></a>
      <a class="text_audio-chellenge"></a>
    </div>
    `;
    element.append(blockForGame);
    this.renderHeart();
  }

  public minusHeart() {
    this.hearts -= 1;
    document.querySelector(".heart_audio-chellenge")?.remove();
    this.renderHeart();
  }

  public renderHeart(num = 5) {
    const element = document.querySelector(
      ".layoutForAudioChallenge"
    ) as HTMLElement;
    const div = document.createElement("div");
    div.classList.add("heart_audio-chellenge");
    let counter = 0;
    while (counter < num) {
      const img = new Image();
      if (this.hearts > counter) {
        img.src = "./assets/svg/heart_full.svg";
      } else {
        img.src = "./assets/svg/heart.svg";
      }
      div.append(img);
      counter += 1;
    }
    element.append(div);
  }

  public createAudioFile(element: CardInfo) {
    const audio = document.createElement("audio");
    audio.src = Utils.getFullURL("/") + element.audio;
    audio.onload = () => {
      audio.play();
    };
    return {
      audio: audio,
      startPlay() {
        audio.play();
      },
    };
  }

  public renderResult() {
    this.keyDownEventlistenerRemove();
    document.querySelector(".block-for-game")?.remove();
    document.querySelector(".heart_audio-chellenge")?.remove();
    const mainBlock = document.querySelector(".layoutForAudioChallenge");
    const body = document.createElement("div");
    body.classList.add("body_result");
    const bodyGoodResult = document.createElement("div");
    bodyGoodResult.classList.add("body_good-result");
    bodyGoodResult.innerHTML = `
    <h4>You know <strong>${this.stateResult.goodResult.length}</strong> ${
      this.stateResult.goodResult.length === 0 ||
      this.stateResult.goodResult.length === 1
        ? "word"
        : "words"
    }.</h4>
    <div class="block-for-item_result"></div>
    `;
    const bodyBadResult = document.createElement("div");
    bodyBadResult.classList.add("body_bad-result");
    bodyBadResult.innerHTML = `
    <h2>Training result</h2>
    <h4>You have <strong>${this.stateResult.badResult.length}</strong> ${
      this.stateResult.badResult.length === 0 ||
      this.stateResult.badResult.length === 1
        ? "mistake"
        : "mistakes"
    }.</h4>
    <div class="block-for-item_result"></div>
    `;

    this.drawResultItems(
      this.stateResult.badResult,
      bodyBadResult.querySelector(".block-for-item_result") as HTMLElement
    );
    this.drawResultItems(
      this.stateResult.goodResult,
      bodyGoodResult.querySelector(".block-for-item_result") as HTMLElement
    );

    body.append(bodyBadResult, bodyGoodResult);
    mainBlock?.append(body);
  }

  public keyDownEventlistenerAdd() {
    document.addEventListener("keydown", this.keyboardFuncEvetn);
  }
  public keyDownEventlistenerRemove() {
    document.removeEventListener("keydown", this.keyboardFuncEvetn);
  }

  public keyboardFuncEvetn = (event: KeyboardEvent) => {
    const key = event.code;
    const digitKeys = document.querySelectorAll(".text_audio-chellenge");
    const clickEvent = new Event("click");
    switch (key) {
      case "Digit1":
        digitKeys[0].dispatchEvent(clickEvent);
        break;
      case "Digit2":
        digitKeys[1].dispatchEvent(clickEvent);
        break;
      case "Digit3":
        digitKeys[2].dispatchEvent(clickEvent);
        break;
      case "Digit4":
        digitKeys[3].dispatchEvent(clickEvent);
        break;
      case "Space":
        document
          .querySelector(".logo-sound_audio-chellenge")
          ?.dispatchEvent(clickEvent);
        break;
      default:
        break;
    }
  };

  public drawKeyHelper() {
    const mainWindow = document.querySelector(".block-for-game");
    const viewHelper = document.createElement("div");
    viewHelper.classList.add("helper-window");
    viewHelper.innerHTML = `
    <h4>You can use follow keys:</h4>
    <ul>
      <li>1</li>
      <li>2</li>
      <li>3</li>
      <li>4</li>
      <li>Space</li>
    </ul>
    `;
    mainWindow?.append(viewHelper);
  }

  private drawResultItems(arr: CardInfo[], elem: HTMLElement) {
    arr.forEach((el) => {
      const divBlockForItem = document.createElement("div");
      divBlockForItem.classList.add("block-for-item");

      divBlockForItem.innerHTML = `
    <a class="link-to-sound_result">
      <img src="./assets/svg/volume-up.svg">
      <audio src="${Utils.getFullURL("/") + el.audio}">
    </a>
    <p><strong>${el.word}</strong> -
    ${el.wordTranslate} 
    </p>
    `;
      const ahrefForAudio = divBlockForItem.querySelector("a") as HTMLElement;
      ahrefForAudio.onclick = () => {
        ahrefForAudio.querySelector("audio")?.play();
      };
      elem.append(divBlockForItem);
    });
  }

  private clearState(): void {
    this.stateCard = [];
    this.stateCheck = [];
    this.stateResult = { goodResult: [], badResult: [] };
  }

  public async after_render(): Promise<void> {
    this.changeBtn();
    this.startAudioChallenge();
    return;
  }
}

export default AudioChallenge;

// document.addEventListener('keydown', (event)=> {
//   console.log(event.target)
// })
