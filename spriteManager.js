let spriteManager = {
    image: new Image(),
    sprites: new Array(),
    imgLoadCount: 0,
    imgLoaded: false,
    jsonLoaded: false,
    loadAtlas(atlasJson) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                spriteManager.parseAtlas(request.responseText);
            }
        };
        request.open("GET", atlasJson, true);
        request.send();
    },
    parseAtlas(atlasJSON) {
        let atlas = JSON.parse(atlasJSON).tiles;
        for (let im of atlas) {
            let img = new Image();
            img.src = 'map/' + im.image;
            img.onload = () => {
                spriteManager.imgLoadCount++;
                if (spriteManager.imgLoadCount === atlas.length) {
                    spriteManager.imgLoaded = true;
                }
                this.sprites.push({name: im.image, src: img, w: im.imagewidth, h: im.imageheight});
            }
            this.jsonLoaded = true;
        }
    },
    drawSprite(ctx, name, x, y) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => { spriteManager.drawSprite(ctx, name, x, y); }, 100);
        } else {
            let sprite = this.getSprite(name);
            if (!mapManager.isVisible(x, y, sprite.w, sprite.h))
                return;
            x -= mapManager.view.x;
            y -= mapManager.view.y;
            ctx.drawImage(sprite.src, x, y);
        }
    },
    getSprite(name) {
        return this.sprites.find(el => el.name === name);
    }
};