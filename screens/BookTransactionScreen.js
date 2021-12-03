import React from 'react';
import {
  Text,
  KeyboardAvoidingView,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ToastAndroid
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../config'


export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      buttonState: 'normal',
      scannedBookId: '',
      scannedStudentId: '',
    };
  }

  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      hasCameraPermissions: status === 'granted',
      buttonState: id,
      scanned: false,
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const { buttonState } = this.state;
    if (buttonState === 'BookId') {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal',
      });
    } else if (buttonState === 'StudentId') {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal',
      });
    }
  };

  initiateBookIssue = async()=>{
 db.collection('transactions').add({
   'studentId': this.state.scannedStudentId,
   'bookId': this.state.scannedBookId,
   'date': firebase.firestore.Timestamp.now().toDate(),
   'transactionType': "Return"
 })

 db.collection("books").doc(this.state.scannedBookId).update({
  'bookAvailability': true
})

db.collection("students").doc(this.state.scannedStudentId).update({
  'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
})

  }


  initiateBookReturn = async()=>{
    db.collection('transactions').add({
      'studentId': this.state.scannedStudentId,
      'bookId': this.state.scannedBookId,
      'date': firebase.firestore.Timestamp.now().toDate(),
      'transactionType': "Issue"
    })
   
    db.collection("books").doc(this.state.scannedBookId).update({
     'bookAvailability': false
   })
   
   db.collection("students").doc(this.state.scannedStudentId).update({
     'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
   })


  }
 handleTransaction = async()=>{
   var transactionMessage 
   db.collection('books').doc(this.state.scannedBookId).get()
   .then((doc)=>{
     var book = doc.data();
     if(book.bookAvailability){
        this.initiateBookIssue();
        transactionMessage = "Book Issued";
       // alert(transactionMessage)
       ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
      
     }
     else{
      this.initiateBookReturn();
      transactionMessage = "Book Returned";
      //alert(transactionMessage)
      ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
     }
   })

 }

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;

    if (buttonState != 'normal' && hasCameraPermissions) {
      return (
        <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === 'normal') {
      return (
        //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        //    <Text>{hasCameraPermissions=== true ? this.state.scannedData:"Request For Camera Permission" }</Text>
        //     <TouchableOpacity
        //     onPress={this.getCameraPermissions}
        //      style= {styles.scanButton}>
        //          <Text style ={styles.buttonText}> Scan QR Code </Text>
        //        </TouchableOpacity>
        //      </View>

        <KeyBoardAvoidingView
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} behaviour = "padding" enabled>
          <Image
            source={require('../assets/booklogo.jpg')}
            style={{ width: 200, height: 200 }}
          />
          <Text style={{ textAlign: 'center', fontSize: 30 }}>Willy</Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="BookId"
              onChangedText = {text => this.setState({scannedBookId : text})}
              value={this.state.scannedBookId}></TextInput>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions('BookId');
              }}>
              <Text style={styles.buttonText}> Scan </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="StudentId"
              onChangedText = {text => this.setState({scannedStudentId : text})}
              value={this.state.scannedStudentId}></TextInput>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions('StudentId');
              }}>
              <Text style={styles.buttonText}> Scan </Text>
            </TouchableOpacity >
          </View>
          <TouchableOpacity style= {styles.submitButton}
          onPress ={()=>{
            var transactionMessage = this.handleTransaction();
            this.setState(
              {scannedBookId:'',
               scannedStudentId:''})
          }}>
            <Text style ={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </KeyBoardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  scanButton: {
    backgroundColor: 'blue',
    padding: 10,
    margin: 10,
  },
  buttonText: {
    fontSize: 20,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10,
  },
  buttonText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  inputView: {
    flexDirection: 'row',
    margin: 20,
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20,
  },
  scanButton: {
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
  },
  submitButton:{
    backgroundColor: '#FBC02D',
    width: 100,
    height:50
  },
  submitButtonText:{
    padding: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight:"bold",
    color: 'white'
  }
});
