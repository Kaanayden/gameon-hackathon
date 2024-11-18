export class RemotePlayer {
    constructor(scene, id, x, y) {
        this.scene = scene;
        this.id = id;
        this.sprite = scene.physics.add
            .sprite(x, y, 'guy', 0)
            .setScale(3)
            .setDepth(2);
    }

    update(data) {
        // Update the sprite's position
        this.sprite.setPosition(data.x, data.y);
        
        if(data.anim == 'idle') {
            this.sprite.anims.stop();
            this.sprite.setFrame(0);
        }
        else this.sprite.anims.play(data.anim, true);

    }

    destroy() {
        this.sprite.destroy();
    }
}
