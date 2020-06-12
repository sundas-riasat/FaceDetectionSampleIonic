import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ApiService} from '../api.service';
import {MenuController, NavController, Platform, ToastController} from '@ionic/angular';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';

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
    public hider;
    public total = 0;
    url = '';

    @ViewChild('overlay') canvasOverlay: ElementRef;
    @ViewChild('image') canvasImage: ElementRef;
    public canvasOverlayNe: any;

    constructor(public navCtrl: NavController, public androidPermissions: AndroidPermissions, public platform: Platform, private apiService: ApiService, private toast: ToastController, private menuctrl: MenuController) {

    }

    ngOnInit() {
        this.hider = document.getElementById('hider');
        this.hider.style.display = 'block';
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
                width: {exact: 1280},
                height: {exact: 720},
            }
        };
        if (win.navigator) {
            navigator.getUserMedia(constraints,
                (stream) => {
                    const overlayContext = canvasOverlayNe.getContext('2d');
                    canvasOverlayNe.style.position = 'absolute';
                    canvasOverlayNe.style.top = '0px';
                    canvasOverlayNe.style.zIndex = '100001';
                    canvasOverlayNe.style.display = 'block';
                    const video = document.querySelector('video');
                    video.srcObject = stream;
                    this.setShowVideo();
                    const htracker = new headtrackr.Tracker({
                        detectionInterval: 50,
                        whitebalancing: false,
                        headPosition: false,
                        smoothing: false,
                        retryDetection: true
                    });
                    const canvas = document.querySelector('canvas');
                    htracker.init(video, canvas);
                    htracker.start();
                    // let intr = true;
                    // setInterval(() => {
                    //     if (intr) {
                    //         document.getElementById('detector').style.border = '5px solid red';
                    //     }
                    // }, 500);
                    setTimeout(() => {
                        this.hider.style.display = 'none';
                    }, 500);
                    // document.addEventListener('facetrackingEvent', (event: any) => {
                    //     if (!this.isMenuOpen) {
                    //         overlayContext.clearRect(0, 0, this.width, this.height);
                    //         if (event.detection === 'CS') {
                    //             if (event.x < 400 && event.y < 550){
                    //                 intr = false;
                    //                 setTimeout(() => {
                    //                     intr = true;
                    //                 }, 500);
                    //                 document.getElementById('detector').style.border = '5px solid green';
                    //                 if (this.allowTakePhoto) {
                    //                     this.takePhoto();
                    //                     this.allowTakePhoto = false;
                    //                     setTimeout(() => {
                    //                         this.allowTakePhoto = true;
                    //                         intr = true;
                    //                     }, 2000);
                    //
                    //                 }
                    //             // }
                    //         }
                    //     }
                    // });
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
        this.androidPermissions.requestPermissions([
            this.androidPermissions.PERMISSION.CAMERA,
            this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS,
            this.androidPermissions.PERMISSION.RECORD_AUDIO
        ]).then((data: any) => {
            if (data.hasPermission) {
                console.log('have permission');
            }
        });
    }

    takePhoto() {
        this.presentToast('Recognizing...');
        const canvas = this.canvasImage.nativeElement;
        const videoGet = document.querySelector('video');
        canvas.width = 270;
        canvas.height = 360;
        canvas.getContext('2d').drawImage(videoGet, 0, 0, 270, 360);
        const img = canvas.toDataURL('image/jpeg', 1.0);
        this.imageSrc = img;
        this.apiService.postImage(img, canvas.width, canvas.height)?.subscribe((x: any) => {
        }, err => {
            if (!err.error.text.toString().includes('Error')) {
                this.presentToast(err.error.text);
            } else {
                this.presentToast('Not recognized');
            }
        });
    }

    setURL() {
        this.apiService.setURL(this.url);
    }

    async presentToast(text: string) {
        const toaster = await this.toast.create({
            message: text,
            duration: 2000,
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
