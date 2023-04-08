let gameManager = {
    factory: {},
    entities: [],
    fireNum: 0,
    player: null,
    laterKill: [],
    num_enemies: 0,
    num: 0,
    score: 0,
    name: null,
    game_over: false,
    initPlayer(obj) {
        this.player = obj;
    },
    kill(obj) {
        this.laterKill.push(obj);
    },
    update() {
        if (this.player === null)
            return;
        this.player.move_x = 0;
        this.player.move_y = 0;
        if (eventsManager.action["up"]) this.player.move_y = -1;
        if (eventsManager.action["down"]) this.player.move_y = 1;
        if (eventsManager.action["left"]) this.player.move_x = -1;
        if (eventsManager.action["right"]) this.player.move_x = 1;
        if (eventsManager.action["fire"]) this.player.fire();
        this.entities.forEach((e) => {
            try {
                e.update();
            } catch(ex) {}
        });
        for (let i = 0; i < this.laterKill.length; i++) {
            let idx = this.entities.indexOf(this.laterKill[i]);
            if (idx > -1)
                this.entities.splice(idx, 1);
        }
        if (this.laterKill.length > 0)
            this.laterKill.length = 0;
        mapManager.tLayer = null;
        mapManager.draw(ctx);
        this.draw(ctx);
        this.show_info();
        if (gameManager.num_enemies === 0 && gameManager.num === 1) {
            soundManager.play('effects/victory.mp3');
            ctx.font = 'bold 35px Arial';
            ctx.fillStyle = "black";
            ctx.fillText("Победа!", 300, 352);
            gameManager.player = null;
            gameManager.entities = [];
            gameManager.num += 1;
            gameManager.save_record(gameManager.name, gameManager.score);
            setTimeout(() => {window.open("records.html", "_self");}, 6000);
        }
        if (gameManager.num_enemies === 0 && gameManager.num === 0) {
            soundManager.play('effects/newlevel.mp3');
            ctx.font = 'bold 35px Arial';
            ctx.fillStyle = "white";
            ctx.fillText("Переход на второй уровень!", 100, 352);
            let map2 = "map/tilemap2.tmj";
            gameManager.player = null;
            gameManager.entities = [];
            gameManager.num += 1;
            setTimeout(() => {gameManager.loadAll(map2);}, 2500);
        }
        if (this.game_over) {
            ctx.font = 'bold 35px Arial';
            if (gameManager.num === 0)
                ctx.fillStyle = "white";
            else ctx.fillStyle = "black";
            ctx.fillText("Игра закончена!", 200, 352);
            gameManager.player = null;
            gameManager.entities = [];
            gameManager.save_record(gameManager.name, gameManager.score);
            setTimeout(() => {window.open("records.html", "_self");}, 1500);
        }
    },
    show_info() {
        ctx2.clearRect(0, 0, score.width, score.height);
        ctx2.fillText('Очки: ' + gameManager.score, 15, 20);
        ctx2.fillText('Игрок: ' + gameManager.name, 15, 50);
        ctx2.fillText('Количество здоровья: ' + gameManager.player.lifetime, 15, 80);
    },
    save_record(name, score) {
        if (!localStorage[name]) {
            localStorage[name] = score;
        }
        if (score > localStorage[name]) {
            localStorage[name] = score;
        }
    },
    draw(ctx) {
        for (let e = 0; e < this.entities.length; e++)
            this.entities[e].draw(ctx);
    },
    loadAll(namem) {
        mapManager.imgLoadCount = 0;
        mapManager.imgLoaded = false;
        mapManager.jsonLoaded = false;
        mapManager.loadMap(namem);
        spriteManager.loadAtlas("map/tileset.tsj");
        gameManager.factory['Player'] = Player;
        gameManager.factory['Boxer'] = Boxer;
        gameManager.factory['Bonus'] = Bonus;
        gameManager.factory['Rocket'] = Rocket;
        mapManager.parseEntities();
        mapManager.draw(ctx);
        eventsManager.setup(canvas);
        gameManager.name = localStorage.getItem("game.username");
    },
    play() {
        setInterval(this.updateWorld, 100);
    },
    updateWorld() {
        gameManager.update();
    }
};