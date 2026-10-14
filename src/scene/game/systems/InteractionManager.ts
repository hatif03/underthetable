import * as Phaser from "phaser";
import { InteractionMenu, type MenuOption } from "../entities/InteractionMenu";
import { FRAME_HEIGHT } from "../config/animations";
import { Worker } from "../entities/Worker";
import { Player } from "../entities/Player";
import { publicLine } from "../../lib/events";
import { INTERACT_DISTANCE, PRESS_E_STYLE, PROMPT_Y_OFFSET } from "../../lib/constants";
import type { WorkerManager } from "./WorkerManager";
import type { CameraController } from "./CameraController";

export class InteractionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private workerManager: WorkerManager;
  private cameraController: CameraController;

  interactionMenu!: InteractionMenu;
  nearestWorker: Worker | null = null;
  workerPromptText: Phaser.GameObjects.Text | null = null;
  menuOpen = false;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    workerManager: WorkerManager,
    cameraController: CameraController,
  ) {
    this.scene = scene;
    this.player = player;
    this.workerManager = workerManager;
    this.cameraController = cameraController;
  }

  initInteractionUI() {
    this.workerPromptText = this.scene.add
      .text(0, 0, "Look", PRESS_E_STYLE as Phaser.Types.GameObjects.Text.TextStyle)
      .setResolution(window.devicePixelRatio * 2)
      .setOrigin(0.5, 1)
      .setDepth(25)
      .setVisible(false);
    this.workerPromptText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

    this.interactionMenu = new InteractionMenu(this.scene);
    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (Math.hypot(pointer.upX - pointer.downX, pointer.upY - pointer.downY) > 12) return
      const nearest = this.findNearestWorker()
      if (nearest && !this.menuOpen) this.openWorkerMenu(nearest)
    })
    this.interactionMenu.onClose = () => {
      this.menuOpen = false;
      this.cameraController.resumeCameraFollow();
    };
  }

  findNearestWorker(): Worker | null {
    let nearest: Worker | null = null;
    let minDist = Infinity;

    for (const worker of this.workerManager.workers) {
      if (!worker.canInteract()) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.sprite.x,
        this.player.sprite.y,
        worker.sprite.x,
        worker.sprite.y,
      );
      if (dist < INTERACT_DISTANCE && dist < minDist) {
        minDist = dist;
        nearest = worker;
      }
    }
    return nearest;
  }

  openWorkerMenu(worker: Worker) {
    this.menuOpen = true;

    const options: MenuOption[] = [
      {
        label: "Hear the line",
        enabled: true,
        action: () => {
          this.menuOpen = false;
          worker.showBubble(publicLine(), 5000);
        },
      },
      {
        label: "Walk on",
        enabled: true,
        action: () => {
          this.menuOpen = false;
        },
      },
    ];

    this.interactionMenu.show(worker.sprite.x, worker.sprite.y, options);
  }

  /** Run proximity detection and prompt display in the update loop. */
  updateProximity(eKey?: Phaser.Input.Keyboard.Key): boolean {
    const nearest = this.findNearestWorker();

    if (nearest !== this.nearestWorker) {
      if (this.nearestWorker) this.nearestWorker.resume();
      this.nearestWorker = nearest;
    }

    if (this.workerPromptText) {
      if (nearest) {
        nearest.pause();
        this.workerPromptText.setPosition(
          nearest.sprite.x,
          nearest.sprite.y - FRAME_HEIGHT * PROMPT_Y_OFFSET,
        );
        this.workerPromptText.setVisible(true);
      } else {
        this.workerPromptText.setVisible(false);
      }
    }

    // E key: worker menu takes priority over boss terminal
    if (nearest && eKey && Phaser.Input.Keyboard.JustDown(eKey)) {
      this.openWorkerMenu(nearest);
      if (this.workerPromptText) this.workerPromptText.setVisible(false);
      return true; // signal: handled interaction
    }

    return false;
  }

  /** Clear nearest if it matches the given worker (used during sync cleanup). */
  clearIfNearest(worker: Worker) {
    if (this.nearestWorker === worker) this.nearestWorker = null;
  }

  destroy() {
    this.interactionMenu?.destroy();
    this.nearestWorker = null;
  }
}
