import "./App.scss";
import Router from "../router/Router";

class App {
  public start(): void {
    const router = new Router();
    router.init();
    // localStorage.clear();
  }
}

export default App;
