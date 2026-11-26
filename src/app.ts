import { runRound } from './games/run';
import { renderMap } from './scenes/map';
import { renderReward } from './scenes/reward';
import { renderStart } from './scenes/start';
import { renderTreehouse } from './scenes/treehouse';

export function startApp(root: HTMLElement): void {
  root.addEventListener('contextmenu', (event) => event.preventDefault());

  const showMap = () => {
    renderMap(root, {
      onGame: (id) => {
        runRound(root, id, (result) => {
          if (!result.completed) showMap();
          else renderReward(root, result, showMap);
        });
      },
      onHome: () => renderTreehouse(root, showMap),
    });
  };

  renderStart(root, showMap);
}
