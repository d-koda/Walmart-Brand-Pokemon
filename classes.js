//Create Sprite class for animation function.
class Sprite{
    //Create a method to explain what a Sprite should look like. Essentially creating the rules for what a member of the Sprite class is.
    //We'll set the parameters of "position + image" to this.____ in order to be able to give whatever we want the class of Sprite.
    constructor({
        position, velocity, image, frames = {max:1, hold:10}, sprites, animate = false, isOpponent = false, rotation=0,  
        }) {
            this.position = position
            this.image = new Image()
            this.frames = {...frames, val: 0, elapsed: 0}
            this.image.onload = () => {
                this.width = this.image.width / this.frames.max
                this.height = this.image.height
            }
            this.image.src = image.src
            this.animate = animate
            this.sprites = sprites
            this.opacity = 1
            this.rotation = rotation
    }
    //Create a method in order to draw whatever image.
    draw() {
        context.save()
        context.translate(
            this.position.x + this.width/2, 
            this.position.y + this.height/2
        )
        context.rotate(this.rotation)
        context.translate(
            -this.position.x - this.width/2, 
            -this.position.y - this.height/2
        )
        context.globalAlpha = this.opacity
        context.drawImage(
            this.image,
            //Here we cut the starter sprite from the sprite sheet. Normally, I think we'd have 4 separate sprites, and we'd want them to show based on the event listener below, but hey, it is what it is.
            this.frames.val * this.width,
            0,
            //Now we center the sprite.
            this.image.width / this.frames.max,
            this.image.height, 
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        )
        context.restore()

        if (!this.animate) return
            
        if (this.frames.max > 1){
                this.frames.elapsed++
            }
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++
            else this.frames.val = 0
            }
        }
}

class Monster extends Sprite {
    constructor ({
        position, 
        velocity, 
        image, 
        frames = {max:1, hold:10}, 
        sprites, 
        animate = false, 
        rotation=0,
        isOpponent = false, 
        name,
        attacks
    }) {
        super({
            position, 
            velocity, 
            image, 
            frames, 
            sprites, 
            animate, 
            rotation,
        })
        this.hp = 100
        this.isOpponent = isOpponent
        this.name = name
        this.attacks = attacks  
    }

    faint() {
        audio.battle.stop()
        audio.victory.play()
        document.querySelector('#dialogueText').innerHTML = this.name + ' fainted!'
        gsap.to(this.position, {
            y:this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
    }

    attack({attack, target, renderedSprites}) {
        document.querySelector('#dialogueText').style.display = 'block'
        document.querySelector('#dialogueText').innerHTML = this.name + ' used ' + attack.name 
        let hpBar = '#opponentHpBar'
        if (this.isOpponent) hpBar = '#playerHpBar'

        let rotation = 0
        if(this.isOpponent) rotation = -3

        target.hp -= attack.damage

        switch (attack.name){
            case 'Fira':
                audio.firaCast.play()
                const firaImg = new Image()
                firaImg.src = './img/fireball.png'
                const fira = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image:firaImg,
                    frames: {
                        max: 4,
                        hold: 15
                    },
                    animate: true,
                    rotation
                })
                renderedSprites.splice(1, 0, fira)
        
                gsap.to(fira.position, {
                    x: target.position.x,
                    y: target.position.y,
                    onComplete: () => {
                        audio.firaHit.play()
                        gsap.to(hpBar,{
                            width: target.hp + '%'
                        })
    
                        gsap.to(target.position,{
                            x: target.position.x + 20,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.1
                        })
    
                        gsap.to(target,{
                            opacity: 0.5,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.1
                        })
                    renderedSprites.splice(1,1)
                    }
                })

                break

            case 'Tackle':
                audio.tackle.play()
                const tl = gsap.timeline()
    
                let movementDistance = 40
                if (this.isOpponent) movementDistance = -40
    
                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }) .to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: .15,
                    onComplete:() => {
                        
                        gsap.to(hpBar,{
                            width: target.hp + '%'
                        })
    
                        gsap.to(target.position,{
                            x: target.position.x + movementDistance,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.1
                        })
    
                        gsap.to(target,{
                            opacity: 0.5,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.1
                        })
                    }
                }) 
                .to(this.position, {
                    x: this.position.x
                })
                break
            }
    }
}

//Create a Block class for collision/battle area. width + height are 48 because we zoomed in on Tiled to 400%, and originally 12x12 => 48x48

class Block {
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw() {
        context.fillStyle = 'rgba(255,0,0,0.0)'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}
