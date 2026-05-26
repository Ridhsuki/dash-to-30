import Phaser from "phaser";

import { DEPTH } from "../constants/layers";
import { GAME_HEX, GAME_RGB } from "../theme/gameTheme";
import type { EntityKind } from "../utils/gameText";

type EntityLabelStyle = {
  width: number;
  height: number;
  bg: number;
  border: number;
  text: string;
};

export function getEntityLabelStyle(kind: EntityKind): EntityLabelStyle {
  const width = kind === "boss" ? 118 : kind === "payday" ? 104 : 108;

  return {
    width,
    height: kind === "boss" ? 28 : 26,
    bg: GAME_RGB.cream,
    border: GAME_RGB.brown,
    text: GAME_HEX.text,
  };
}

export class EntityLabel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly text: Phaser.GameObjects.Text;
  private readonly bg: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    kind: EntityKind,
  ) {
    const style = getEntityLabelStyle(kind);

    this.bg = scene.add
      .rectangle(0, 0, style.width, style.height, style.bg, 0.96)
      .setStrokeStyle(2, style.border, 1);

    this.text = scene.add
      .text(0, 1, label, {
        fontFamily: "monospace",
        fontSize: "11px",
        fontStyle: "bold",
        color: style.text,
        align: "center",
        wordWrap: {
          width: style.width - 12,
          useAdvancedWrap: true,
        },
        maxLines: 2,
      })
      .setOrigin(0.5);

    this.container = scene.add
      .container(Math.round(x), Math.round(y), [this.bg, this.text])
      .setDepth(DEPTH.gameplayLabel);
  }

  update(x: number, y: number) {
    this.container.setPosition(Math.round(x), Math.round(y));
  }

  destroy() {
    this.container.destroy(true);
  }
}
