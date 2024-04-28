interface Listener {
  cmd: string,
  callback: () => void
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
}

interface EventHandler {
  keydown: (e: KeyboardEvent) => void
  keyup: (e: KeyboardEvent) => void
}

export default class VimModeKeyHandler {
  private stack: string[];
  private listeners: Array<Listener>;
  private eventHandler: EventHandler;
  
  constructor() {
    if (window.__vim_mode_key_handler) {
      console.warn("Vim mode key handler has existed in this page.")
    }
    window.__vim_mode_key_handler = this;
    this.stack = []
    this.listeners = [];
    this.eventHandler = {
      keydown: (e) => {
        if (e.shiftKey && e.key && e.key.length === 1) {
          this.stack.push(e.key.toUpperCase());
        } else if (e.key && e.key.length === 1) {
          this.stack.push(e.key);
        }
        const toMatch = this.stack.join("");

        let hasMatchedPrefix = false;
        for (const listener of this.listeners) {
          if (listener.cmd.startsWith(toMatch)) {
            hasMatchedPrefix = true
            if (listener.cmd === toMatch) {
              listener.callback();
              this.endCmd();
              break;
            }
          }
        }
        if (!hasMatchedPrefix) this.endCmd()
      },
      keyup: (e) => {
        for (const listener of this.listeners) {
          if (typeof listener.onKeyUp === "function") listener.onKeyUp(e);
        }
      }
    }
  }

  public start() {
    document.addEventListener("keydown", this.eventHandler.keydown)
    document.addEventListener("keyup", this.eventHandler.keyup)
  }

  public destroy() {
    document.removeEventListener("keydown", this.eventHandler.keydown)
    document.removeEventListener("keyup", this.eventHandler.keyup)
  }

  public subscribe(
    cmd: string,
    callback: () => void,
    options: {
      onKeyUp?: () => void;
    } = {}
  ) {
    this.listeners.push({ cmd, callback, ...options })
  }

  public endCmd() {
    this.stack = []
  }
}
