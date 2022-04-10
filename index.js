//Where the game is getting displayed, since we don't want it to be the whole browser.
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
canvas.width = 1024
canvas.height = 576

//Create a for loop to determine collision. We chose i+=70, because the map is 70 tiles wide, slice collisions into bits of 70, and push the new arrays into collisionMap const.
const collisionMap = []
for (let i = 0; i < collisions.length; i+=70){
    collisionMap.push(collisions.slice(i, 70+i))
}
//Same thing, except for battle zone determining.
const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i+=70){
    battleZonesMap.push(battleZonesData.slice(i, 70+i))
}

//Here we create boundary blocks by making an array. We have to create an index (i), and then compare each value (symbol, j) and then place a block on movement respectively.
const boundaries = []

//Creating an offset and applying value because our images need to be passed through things offset.
const offset = {
    x: -110,
    y: -370
}

collisionMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            boundaries.push(
                new Block({
                    position: {
                        x:j * Block.width + offset.x,
                        y:i * Block.height + offset.y 
                    }
                })
            )
    })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            battleZones.push(
                new Block({
                    position: {
                        x:j * Block.width + offset.x,
                        y:i * Block.height + offset.y 
                    }
                })
            )
    })
})

//Map, player character, foreground.
const map = new Image()
map.src = './img/posermonMap.png'

const pcDown = new Image()
pcDown.src = './img/playerDown.png'

const pcUp = new Image()
pcUp.src = './img/playerUp.png'

const pcLeft = new Image()
pcLeft.src = './img/playerLeft.png'

const pcRight = new Image()
pcRight.src = './img/playerRight.png'

const topLayer = new Image()
topLayer.src = './img/posermonMapTop.png'

//Turn images into Sprites.
const player = new Sprite({
    position:{
        x: canvas.width / 2 - 192 / 4 / 2,
        y: (canvas.height / 2 - 68 / 2) -2
    },
    image: pcDown,
    frames: {
        max:4,
        hold: 20
    },
    sprites: {
        up: pcUp,
        down: pcDown,
        left: pcLeft,
        right: pcRight
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: map,
})

const foreground = new Sprite ({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: topLayer,
})

//Create Keys const, and set them to false, so we can have the listener 'keydown' set them to true, and 'do something' as a result.
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const linkedItems = [background, ...boundaries, foreground, ...battleZones]

function rectangularCollision ({rectangle1, rectangle2}){
    return(
        rectangle1.position.x + rectangle1.width >=rectangle2.position.x && 
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    )
}

const battle = {
    initiated: false
}

//Create a loop so that we can create illusion of movement, but in reality, we're just animate the map, and changing the character sprite in tandem.
function anim() {
    const animationId = window.requestAnimationFrame(anim)
    background.draw()
    boundaries.forEach((boundary) => {
        boundary.draw()
    })
    battleZones.forEach((battleZone) => {
        battleZone.draw()
    })
    player.draw()
    foreground.draw()

    let animate = true
    player.animate = false

    if (battle.initiated) return
//Battle activation code
    if (keys.w.pressed||keys.a.pressed||keys.s.pressed||keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea = 
                (Math.min(
                    player.position.x + player.width, 
                    battleZone.position.x + battleZone.width
                ) - 
                Math.max(player.position.x, battleZone.position.x)) *
                    (Math.min(
                        player.position.y + player.height,
                        battleZone.position.y + battleZone.height
                ) - 
                    Math.max(player.position.y, battleZone.position.y))
        if (
            rectangularCollision({
                rectangle1: player,
                rectangle2: battleZone
            }) &&
                overlappingArea > (player.width * player.height) / 2 &&
                Math.random() < 0.08
            ) {
                //deactivate overworld animation loop
                window.cancelAnimationFrame(animationId)
                //activate battle sequence loop'
                audio.Map.stop()
                audio.initBattle.play()
                audio.battle.play()
                battle.initiated = true
                gsap.to('#battle-transition', {
                    opacity: 1,
                    repeat: 4,
                    yoyo: true,
                    duration: .3,
                    onComplete() {
                        gsap.to('#battle-transition', {
                            opacity: 1,
                            duration: .3,
                            onComplete() {
                                initBattle()
                                animateBattle()
                                gsap.to('#battle-transition', {
                                    opacity: 0,
                                    duration: .3
                                })
                            }
                        })
                    }
                })
                break
            }
        } 
    }

//W movement
    if(keys.w.pressed && lastPress ==='w') { 
        player.animate = true
        player.image = pcUp

        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3
                    }
                }
            })
        ) {
                animate = false
                break
            }
        }

        if (animate)
        linkedItems.forEach((movable) => {
            movable.position.y += 3
        })
//A movement
    }else if(keys.a.pressed && lastPress ==='a') {
        player.animate = true 
        player.image = pcLeft

        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {...boundary, position: {
                        x: boundary.position.x + 3,
                        y: boundary.position.y 
                    }
                }
            })
        ) {
                animate = false
                break
            }
        }

        if (animate)       
        linkedItems.forEach((movable) => {
            movable.position.x += 3
        })
//S movement
    }else if(keys.s.pressed && lastPress ==='s') {
        player.animate = true
        player.image = pcDown

        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y - 3
                    }
                }
            })
        ) {
                animate = false
                break
            }
        }

        if (animate)        
        linkedItems.forEach((movable) => {
            movable.position.y -= 3
        })
//D movement
    }else if(keys.d.pressed && lastPress ==='d') {
        player.animate = true
        player.image = pcRight

        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {...boundary, position: {
                        x: boundary.position.x -3,
                        y: boundary.position.y 
                    }
                }
            })
        ) {
                animate = false
                break
            }
        }

        if (animate)
        linkedItems.forEach((movable) => {
            movable.position.x -= 3
        })
    } 
}

//lastPress makes it so that even if you have 2 keys pressed simultaneously, you're animate in whatever direction the most recently pressed key is, and not in original direction.
let lastPress= ''
//In this (e) is short for event. This listener is actively listening for WASD movements, and reacting based on that.
window.addEventListener('keydown', (e) => {
    switch(e.key){
        case 'w':
            keys.w.pressed = true
            lastPress = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastPress = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastPress = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastPress = 'd'
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch(e.key){
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})

let clicked = false
addEventListener('click', () =>{
    if(!clicked){
        audio.Map.play()
        clicked = true
    }
})