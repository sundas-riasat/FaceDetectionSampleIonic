import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ApiService} from '../api.service';
import {MenuController, NavController, Platform, ToastController} from '@ionic/angular';

declare const cordova: any;
import headtrackr from 'headtrackr';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
    @Input() name: string;
    public width = window.innerWidth;    // width of photo which will be captured
    public height = window.innerHeight;     // height of photo which will be captured
    public imageSrc = '';
    public text = '';
    public showVideo = false;
    public allowTakePhoto = true;
    public isMenuOpen = false;
    url = '';

    @ViewChild('overlay') canvasOverlay: ElementRef;
    @ViewChild('image') canvasImage: ElementRef;
    public canvasOverlayNe: any;

    constructor(public navCtrl: NavController, public platform: Platform, private apiService: ApiService, private toast: ToastController, private menuctrl: MenuController) {

    }

    ngOnInit() {
    }


    ngAfterViewInit() {
        const canvasOverlayNe = this.canvasOverlay.nativeElement;
        this.init(canvasOverlayNe);

    }

    init(canvasOverlayNe) {
        this.platform.ready().then(() => {
            if (this.platform.is('cordova')) {
                this.handleCameraPermission(() => {
                    this.initDetection(canvasOverlayNe);
                });
            }
            this.initDetection(canvasOverlayNe);
        });
    }

    public initDetection(canvasOverlayNe) {
        const win: any = window;
        const constraints = {
            audio: false,
            video: {
                width: { exact: 1280 },
                height: { exact: 720 },
            }
        };
        if (win.navigator) {
            navigator.getUserMedia(constraints,
                (stream) => {
                    const overlayContext = canvasOverlayNe.getContext('2d');
                    //
                    const {width, height} =  stream.getTracks()[0].getSettings();
                    console.log(width, height);
                    canvasOverlayNe.style.position = 'absolute';
                    canvasOverlayNe.style.top = '0px';
                    canvasOverlayNe.style.zIndex = '100001';
                    canvasOverlayNe.style.display = 'block';
                    const video = document.querySelector('video');
                    video.srcObject = stream;
                    this.setShowVideo();
                    const htracker = new headtrackr.Tracker({detectionInterval: 50});
                    const canvas = document.querySelector('canvas');
                    htracker.init(video, canvas);
                    htracker.start();
                    document.addEventListener('facetrackingEvent', (event: any) => {
                        if (!this.isMenuOpen) {
                            // clear canvas
                            overlayContext.clearRect(0, 0, this.width, this.width);
                            //  once we have stable tracking, draw rectangle

                            if (event.detection === 'CS') {
                                overlayContext.translate(event.x, event.y);
                                overlayContext.rotate(event.angle - (3.14 / 2));
                                overlayContext.strokeStyle = '#00CC00';
                                overlayContext.strokeRect(event.x, event.y, event.width, event.height);
                                overlayContext.rotate((3.14 / 2) - event.angle);
                                overlayContext.translate(-event.x, -event.y);
                                if (this.allowTakePhoto) {
                                    this.takePhoto();
                                    this.allowTakePhoto = false;
                                    setTimeout(() => {
                                        this.allowTakePhoto = true;
                                    }, 2000);

                                }
                            }
                        }
                    });
                }, (err) => {
                    console.log('err: ', err);
                }
            );
        } else {
            console.log('phonertc is not defined');
        }
    }

    setShowVideo() {
        const video = document.querySelector('video');
        video.style.display = 'block';
        video.style.height = '100%';
    }

    menuOpened() {
        const video = document.querySelector('video');
        this.isMenuOpen = true;
        video.pause();
    }

    menuClosed() {
        const video = document.querySelector('video');
        video.play();
        this.isMenuOpen = false;
    }

    public handleCameraPermission(cb) {
        const permissions = cordova.plugins.permissions;
        permissions.requestPermissions([
            permissions.CAMERA,
            permissions.MODIFY_AUDIO_SETTINGS,
            permissions.RECORD_AUDIO
        ], (status) => {
            cb(status);
        }, (err) => {
            console.log('error on request permissions: ', err);
        });
    }

    takePhoto() {

        const canvas = this.canvasImage.nativeElement;
        const videoGet = document.querySelector('video');
        canvas.width = 270;
        canvas.height = 360;
        canvas.getContext('2d').drawImage(videoGet, 0, 0, 270, 360);
        const img = canvas.toDataURL('image/jpeg', 1.0);
        this.imageSrc = img;
        this.base64ToArrayBuffer(img, canvas.width, canvas.height);

    }

    base64ToArrayBuffer(base64, w, h) {
        const startTime = (new Date()).getTime();
        let endTime;
        this.apiService.postImage(base64, w, h)?.subscribe((x: any) => {
            // this.presentToast(JSON.stringify(x.message) );
        }, err => {
            if (!err.error.text.toString().includes('Error')) {
                this.presentToast(err.error.text);
                // endTime = (new Date()).getTime();
                // this.presentToast('Took ' + (endTime - startTime) + 'ms');
            }
        });

    }

    setURL() {
        this.apiService.setURL(this.url);
    }

    async presentToast(text: string) {
        const toaster = await this.toast.create({
            message: text,
            duration: 4000,
            position: 'bottom'
        });

        toaster.present();
    }

    async openMenu() {
        await this.menuctrl.open();
    }

    takeFace() {

    }
}
