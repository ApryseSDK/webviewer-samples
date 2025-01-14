import { LightningElement } from 'lwc';

export default class PdftronWatermarkLoader extends LightningElement {
    get acceptedFormats() {
        return ['.png'];
    }
}