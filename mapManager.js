let mapManager = {
    mapData: null,
    tLayer: null,
    tSet: null,
    xCount: 0,
    yCount: 0,
    tSize: {x: 32, y: 32},
    mapSize: {x: 22, y: 22},
    tilesets: new Array(),
    pict: [],
    imgLoadCount: 0,
    imgLoaded: false,
    jsonLoaded: false,
    view: {
        x: 0,
        y: 0,
        w: 704,
        h: 704,
    },
    parseMap(tilesJSON) {
        this.mapData = JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.yCount * this.tSize.y;

        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            let imageSrc = "map/" + (this.mapData.tilesets[i].source);
            let request = new XMLHttpRequest();
            request.onreadystatechange = () => {
                if(request.readyState === 4 && request.status === 200) {
                    mapManager.tSet = JSON.parse(request.responseText).tiles;
                    for (let t_im of mapManager.tSet) {
                        let img = new Image();
                        img.src = 'map/' + t_im.image;
                        img.onload = () => {
                            mapManager.imgLoadCount++;
                            if (mapManager.imgLoadCount === mapManager.tSet.length) {
                                mapManager.imgLoaded = true;
                            }
                            mapManager.pict.push({img: img, id: t_im.id});
                        }
                    }
                }
            }
            request.open('GET', imageSrc, true);
            request.send();

            let t  = this.mapData.tilesets[i];
            let ts = {
                firstgid: t.firstgid,
                imageSource: imageSrc,
                name: t.name,
                xCount: Math.floor(32 / mapManager.tSize.x),
                yCount: Math.floor(32 / mapManager.tSize.y)
            };
            this.tilesets.push(ts);
        }
        this.jsonLoaded = true;
    },
    loadMap(path) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                mapManager.parseMap(request.responseText);
            }
        };
        request.open("GET", path, true);
        request.send();
    },
    draw(ctx) {
        if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
            setTimeout(() => { mapManager.draw(ctx); }, 100);
        } else {
            if (this.tLayer === null) {
                for (let id = 0; id < this.mapData.layers.length; id++) {
                    let layer = this.mapData.layers[id];
                    if (layer.type === 'tilelayer') {
                        this.tLayer = layer;
                    }
                    for (let i = 0; i < this.tLayer.data.length; i++) {
                        if (this.tLayer.data[i] !== 0) {
                            let tile = this.getTile(this.tLayer.data[i]);
                            let pX = (i % this.xCount) * this.tSize.x;
                            let pY = Math.floor(i / this.xCount) * this.tSize.y;
                            if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y)) {
                                continue;
                            }
                            pX -= this.view.x;
                            pY -= this.view.y;
                            ctx.drawImage(tile.img, pX, pY);
                        }
                    }
                }
            }
        }
    },
    getTile(tileIndex) {
        let tile = {
            img: null,
            px: 0, py: 0,
            index: tileIndex,
        };
        let tileset = this.getTileset(tileIndex);
        tile.img = this.pict.filter(el => el.id === tile.index - tileset.firstgid)[0].img;
        let id = tileIndex - tileset.firstgid;
        let x = id % tileset.xCount;
        let y = Math.floor(id / tileset.xCount);
        tile.px = x * mapManager.tSize.x;
        tile.py = y * mapManager.tSize.y;
        return tile;
    },
    getTileset(tileIndex) {
        for (let i = mapManager.tilesets.length - 1; i >= 0; i--)
            if (mapManager.tilesets[i].firstgid <= tileIndex) {
                return mapManager.tilesets[i];
            }
        return null;
    },
    isVisible(x, y, width, height){
        if (x + width <= this.view.x || y + height <= this.view.y ||
            x >= this.view.x + this.view.w ||
            y >= this.view.y + this.view.h) {
            return false;
        }
        return true;
    },
    parseEntities() {
        if(!mapManager.imgLoaded || !mapManager.jsonLoaded){
            setTimeout(() => {mapManager.parseEntities();}, 100);
        } else {
            for (let j = 0; j < this.mapData.layers.length; j++) {
                if (this.mapData.layers[j].type === 'objectgroup') {
                    let entities = this.mapData.layers[j];
                    for (let i = 0; i < entities.objects.length; i++) {
                        let e = entities.objects[i];
                        try{
                            let obj = new gameManager.factory[e.class]();
                            obj.name = e.name;
                            obj.pos_x = e.x;
                            obj.pos_y = e.y - e.height;
                            obj.size_x = e.width;
                            obj.size_y = e.height;
                            gameManager.entities.push(obj);
                            if (e.class === "Boxer") {
                                gameManager.num_enemies += 1;
                            }
                            if(obj.name === 'player'){
                                console.log('Плеер найден');
                                gameManager.initPlayer(obj);
                            }
                        } catch(ex) {
                            console.log('Error while creating: [' + e.gid + '] ' + e.class + ', ' + ex);
                        }
                    }
                }
            }
        }
    },
    getTilesetIdx(x, y) {
        let wX = x;
        let wY = y;
        let idx = Math.floor(wY/this.tSize.y) * this.xCount + Math.floor(wX/this.tSize.x);
        return this.tLayer.data[idx];
    },
    centerAt(x, y) {
        if(x < this.view.w/2){
            this.view.x = 0;
        } else if(x > this.mapSize.x * this.tSize.x - this.view.w/2){
            this.view.x = this.mapSize.x * this.tSize.x - this.view.w;
        } else {
            this.view.x = (x - (this.view.w/2));
        }
        if(y < this.view.h/2){
            this.view.y = 0;
        } else if(y > this.mapSize.y * this.tSize.y - this.view.h/2){
            this.view.y = (this.mapSize.y * this.tSize.y - this.view.h);
        } else {
            this.view.y = (y - (this.view.h/2));
        }
    }
}