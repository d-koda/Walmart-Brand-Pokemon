const battleBackgroundImg = new Image()
battleBackgroundImg.src = './img/battleBackground.png'
const battleBackground = new Sprite ({
    position:{
        x:0,
        y:0
        },
    image: battleBackgroundImg
})

let draggle 
let emby
let renderedSprites
let battleAnimationId
let battleQueue

function initBattle() {
    document.querySelector('#combatUi').style.display = 'block'
    document.querySelector('#dialogueText').style.display = 'none'
    document.querySelector('#opponentHpBar').style.width = '100%'
    document.querySelector('#playerHpBar').style.width = '100%'
    document.querySelector('#attacksText').replaceChildren()
    
    draggle = new Monster(monsters.Draggle)
    emby = new Monster(monsters.Emby)
    renderedSprites = [draggle, emby]
    battleQueue = []

    emby.attacks.forEach((attack) =>{
        const monMove = document.createElement('button')
        monMove.innerHTML = attack.name
        document.querySelector('#attacksText').append(monMove)
    })
    //Attack event listeners
    document.querySelectorAll('button').forEach((monMove) => {
        monMove.addEventListener('click', (e) => {
            const attackChoice = attacks[e.currentTarget.innerHTML]
            emby.attack({
                attack: attackChoice,
                target: draggle,
                renderedSprites
            })
    
            if(draggle.hp <= 0) {
                battleQueue.push(() => {
                    draggle.faint()
                })
                battleQueue.push(() => {
                    //fade to black
                    gsap.to('#battle-transition', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId)
                            anim()
                            document.querySelector('#combatUi').style.display = 'none'
    
                            gsap.to('#battle-transition',{
                                opacity:0
                            })

                            battle.initiated = false
                            audio.Map.play()
                        }
                    })
                })
            }
            //opponent attack code
            const randomAttack =
                draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]
    
            battleQueue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    target: emby,
                    renderedSprites
                })
            if(emby.hp <= 0) {
                battleQueue.push(() => {
                    emby.faint()
            })
                battleQueue.push(() => {
                    //fade to black
                    gsap.to('#battle-transition', {
                        opacity: 1,
                        onComplete: () => {
                            audio.battle.stop()
                            cancelAnimationFrame(battleAnimationId)
                            anim()
                            document.querySelector('#combatUi').style.display = 'none'

                            gsap.to('#battle-transition',{
                                opacity:0
                        })
                        battle.initiated = false
                        audio.Map.play()
                    }
                })
            })
            return
            }
            })
        })
        monMove.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML]
            document.querySelector('#typeText').innerHTML = selectedAttack.type
            document.querySelector('#typeText').style.color = selectedAttack.color
        })
    })
    
    document.querySelector('#dialogueText').addEventListener('click', (e) => {
        if (battleQueue.length > 0) {
            battleQueue[0]()
            battleQueue.shift()
        } else 
            e.currentTarget.style.display = 'none'
    })
}

function animateBattle(){ 
        battleBackground.draw()
        renderedSprites.forEach((sprite) => {
            sprite.draw()
        })
    battleAnimationId = window.requestAnimationFrame(animateBattle)
}
anim()
//initBattle()
//animateBattle()

document.querySelector('#dialogueText').addEventListener('click', (e) => {
    if (battleQueue.length > 0) {
        battleQueue[0]()
        battleQueue.shift()
    } else 
        e.currentTarget.style.display = 'none'
})