// Ported from the newer Saltline bundle (app/showcases.js).
import { effectsShowcaseModule } from "../effects/effects.js";
import { ib_2 } from "../enemies/enemies.js";
import { materialsShowcaseModule } from "../render/materials/materials.js";
import { rendererShowcaseModule } from "../render/renderer.js";
import { zy } from "../weapons/animation.js";
import { weaponShowcaseModule } from "../weapons/weapon.js";
import { backdropShowcaseModule } from "../world/backdrop/backdrop.js";
import { groundShowcaseModule } from "../world/ground/ground.js";
import { levelShowcaseModule } from "../world/level/level.js";
import { propsShowcaseModule } from "../world/props/props.js";

var SHOWCASE_MODULES = {
  mats: materialsShowcaseModule,
  level: levelShowcaseModule,
  backdrop: backdropShowcaseModule,
  ground: groundShowcaseModule,
  fx: effectsShowcaseModule,
  weapon: weaponShowcaseModule,
  hands: zy,
  enemies: ib_2,
  props: propsShowcaseModule,
  render: rendererShowcaseModule,
};

export { SHOWCASE_MODULES };
