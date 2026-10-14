import * as Phaser from "phaser";

export class CameraController {
  private scene: Phaser.Scene;

  cameraDragging = false;
  cameraFollowing = true;
  mapWidth = 0;
  mapHeight = 0;

  constructor(
    scene: Phaser.Scene,
    _playerSprite: Phaser.Physics.Arcade.Sprite,
    mapWidth: number,
    mapHeight: number,
  ) {
    this.scene = scene;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  init() {
    const cam = this.scene.cameras.main;
    cam.setBackgroundColor("#f5f5f3");
    cam.setRoundPixels(true);
    cam.stopFollow();
    this.frameMap();
    this.scene.scale.on("resize", () => this.frameMap());
  }

  resumeCameraFollow() {
    this.cameraFollowing = true;
    this.frameMap();
  }

  /** Fit the whole office in the canvas, with a margin, at whatever size the page gives it. */
  frameMap() {
    const cam = this.scene.cameras.main;
    if (cam.width < 2 || cam.height < 2 || this.mapWidth < 1 || this.mapHeight < 1) return;
    const content = { x: 96, y: 96, width: 1200, height: 816 }
    const inset = 0.98
    const zoom = Math.min((cam.width * inset) / content.width, (cam.height * inset) / content.height)
    cam.setZoom(zoom)
    this.updateCameraBounds()
    cam.centerOn(content.x + content.width / 2, content.y + content.height / 2)
  }

  /** Recalculate camera bounds so the map is centered when viewport > map at current zoom. */
  updateCameraBounds() {
    const cam = this.scene.cameras.main;
    const viewW = cam.width / cam.zoom;
    const viewH = cam.height / cam.zoom;
    const mw = this.mapWidth;
    const mh = this.mapHeight;

    const bx = viewW > mw ? -(viewW - mw) / 2 : 0;
    const by = viewH > mh ? -(viewH - mh) / 2 : 0;
    const bw = viewW > mw ? viewW : mw;
    const bh = viewH > mh ? viewH : mh;

    cam.setBounds(bx, by, bw, bh);
  }
}
