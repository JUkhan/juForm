import {Directive, ElementRef} from '@angular/core';


@Directive({
  selector : '[animate-box]',
  exportAs : 'ab' // Necessary, we export it and we can get its 'toggle' method in the template
})
class AnimateBox {
  constructor(private _e: ElementRef) {}

  toggle(isVisible: boolean = false) {
    let animation:any = {};
    animation
      .setDuration(1000); // Duration in ms

    // If is not visible, we make it slide down
    if(!isVisible) {

      animation
        // Set initial styles
        .setFromStyles({height: '0', width: '50%', overflow: 'hidden'})
        // Set styles that will be added when the animation ends
        .setToStyles({height: '300px'})
    } 
    // If is visible we make it slide up
    else {
      animation
        .setFromStyles({height: '300px', width: '50%'})
        .setToStyles({height: '0'})
    }

    // We start the animation in the element, in this case the div
    animation.start(this._e.nativeElement);
  }
}