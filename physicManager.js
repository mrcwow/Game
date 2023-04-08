let physicManager = {
    update(obj) {
        if (obj.move_x === 0 && obj.move_y === 0)
            return "stop";

        let newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        let newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);

        let ts = mapManager.getTilesetIdx(newX + obj.size_x / 4, newY + obj.size_y / 4);
        let e = this.entityAtXY(obj, newX, newY);
        if (e!== null && obj.onTouchEntity)
            obj.onTouchEntity(e);
        if (ts !== 0 && obj.onTouchMap)
            obj.onTouchMap(ts);

        if (ts === 0 && e === null) {
            obj.pos_x = newX;
            obj.pos_y = newY;
        } else
            return "break";

        return "move";
    },
    entityAtXY(obj, x, y) {
        for (let i = 0; i < gameManager.entities.length; i++) {
            let e = gameManager.entities[i];
            if (e.name !== obj.name) {
                if (x + obj.size_x / 1.3 < e.pos_x || y + obj.size_y < e.pos_y || x > e.pos_x + e.size_x || y > e.pos_y + e.size_y / 1.2)
                    continue;
                return e;
            }
        }
        return null;
    }
};