import VimModeKeyHandler from "../src/scripts/vim-mode/key-handler";

declare global {
  interface Window {
    __vim_mode_key_handler?: VimModeKeyHandler;
  }
}
