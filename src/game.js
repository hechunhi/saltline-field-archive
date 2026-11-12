// Ported from the newer Saltline bundle (game.js).
import { showFatalError } from "./app/diagnostics.js";
import { startGame } from "./app/runtime.js";

startGame().catch((i) => showFatalError((i && i.stack) || i));
