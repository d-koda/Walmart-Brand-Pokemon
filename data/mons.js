//Monsters!
const monsters = {
    Emby: {
        position: {        
            x:280,
            y:320
        },
        image: {
            src: './img/embySprite.png'
        },
        frames: {
            max: 4,
            hold: 60
        },
        animate: true,
        name: 'Emby',
        attacks: [attacks.Tackle, attacks.Fira]
    },
    Draggle: {
        position: {        
            x:800,
            y:100
        },
        image: {
            src: './img/draggleSprite.png'
        },
        frames: {
            max: 4,
            hold: 60
        },
        animate: true,
        isOpponent: true,
        name: 'Draggle',
        attacks: [attacks.Tackle, attacks.Fira]
    }
}