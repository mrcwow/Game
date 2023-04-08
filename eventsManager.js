let eventsManager = {
    bind: [],
    action: [],
    setup(canvas) {
        this.bind[87] = 'up';
        this.bind[65] = 'left';
        this.bind[83] = 'down';
        this.bind[68] = 'right';
        this.bind[32] = 'fire';
        canvas.addEventListener("mousedown", this.onMouseDown);
        canvas.addEventListener("mouseup", this.onMouseUp);
        document.body.addEventListener("keydown", this.onKeyDown);
        document.body.addEventListener("keyup", this.onKeyUp);
    },
    onMouseDown(event) {
        eventsManager.action["fire"] = true;
    },
    onMouseUp(event) {
        eventsManager.action["fire"] = false;
    },
    onKeyDown(event) {
        let action = eventsManager.bind[event.keyCode];
        if (action)
            eventsManager.action[action] = true;
    },
    onKeyUp(event) {
        let action = eventsManager.bind[event.keyCode];
        if (action)
            eventsManager.action[action] = false;
    }
};