import { LightningElement, api, wire } from 'lwc';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation'

export default class PdftronNoViewerComponentTester extends LightningElement {
    @api recordId;
    currentDoc
    @wire(CurrentPageReference) pageRef


    // connectedCallback () {
    //     registerListener('blobSelected', this.handleBlobSelected, this)
    // }

    // handleBlobSelected (file) {
    //     currentDoc = file;
    // }

    // handleConvertBlob (){

    // }
}