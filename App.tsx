import React, { useEffect, useState } from "react"
import { StyleSheet, Text, View, SafeAreaView } from "react-native"
import { DeviceEventEmitter } from "react-native"
import DataWedgeIntents from "react-native-datawedge-intents"
import { CheckBox } from "react-native-elements"

interface Scan {
  data: string
  decoder: string
  timeOfScan: string
}

interface ScanIntent {
  'com.symbol.datawedge.data_string': string
  'com.symbol.datawedge.source': string
  'com.symbol.datawedge.label_type': string
}

export default function App() {
  const [scans, setScans] = useState<Scan[]>([])
  const [ean8checked, setEan8checked] = useState(true)
  const [ean13checked, setEan13checked] = useState(true)
  const [code39checked, setCode39checked] = useState(true)
  const [code128checked, setCode128checked] = useState(true)

  const registerBroadcastReceiver = () => {
    DataWedgeIntents.registerBroadcastReceiver({
      filterActions: [
        "com.zebra.reactnativedemo.ACTION",
        "com.symbol.datawedge.api.RESULT_ACTION",
      ],
      filterCategories: ["android.intent.category.DEFAULT"],
    })
  }

  const barcodeScanned = (scanData: ScanIntent, timeOfScan: string) => {
    var scannedData = scanData["com.symbol.datawedge.data_string"]
    var scannedType = scanData["com.symbol.datawedge.label_type"]
    console.log("Scan: " + scannedData)
    const copy = [...scans]
    copy.unshift({
      data: scannedData,
      decoder: scannedType,
      timeOfScan: timeOfScan,
    })
    setScans(copy)
  }

  const broadcastReceiver = (intent: ScanIntent) => {
    //  Broadcast received
    console.log("Received Intent: " + JSON.stringify(intent))

    if (intent.hasOwnProperty("com.symbol.datawedge.data_string") && intent.hasOwnProperty("com.symbol.datawedge.source") && intent["com.symbol.datawedge.source"] === 'scanner' && intent.hasOwnProperty("com.symbol.datawedge.label_type")) {
      //  A barcode has been scanned
      barcodeScanned(intent, new Date().toLocaleString())
    }
  }

  useEffect(() => {
    DeviceEventEmitter.addListener(
      "datawedge_broadcast_intent",
      broadcastReceiver
    )
    registerBroadcastReceiver()

    return () => {
      DeviceEventEmitter.removeAllListeners("datawedge_broadcast_intent")
    }
  }, [broadcastReceiver])

  const setDecoders = () => {
    //  Set the new configuration
    var profileConfig = {
      PROFILE_NAME: "ZebraReactNativeDemo",
      PROFILE_ENABLED: "true",
      CONFIG_MODE: "UPDATE",
      PLUGIN_CONFIG: {
        PLUGIN_NAME: "BARCODE",
        PARAM_LIST: {
          //"current-device-id": this.selectedScannerId,
          scanner_selection: "auto",
          decoder_ean8: "" + ean8checked,
          decoder_ean13: "" + ean13checked,
          decoder_code128: "" + code128checked,
          decoder_code39: "" + code39checked,
        },
      },
    }
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig)
  }

  const sendCommand = (extraName: string, extraValue: any) => {
    console.log(
      "Sending Command: " + extraName + ", " + JSON.stringify(extraValue)
    )
    var broadcastExtras: any = {}
    broadcastExtras[extraName] = extraValue
    broadcastExtras["SEND_RESULT"] = "true"
    DataWedgeIntents.sendBroadcastWithExtras({
      action: "com.symbol.datawedge.api.ACTION",
      extras: broadcastExtras,
    })
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.h1}>Zebra ReactNative DataWedge Demo</Text>
        <View style={{ flexDirection: "row" }}>
          <CheckBox
            title="EAN 8"
            checked={ean8checked}
            onPress={() => {
              setDecoders()
              setEan8checked(!ean8checked)
            }}
          />
          <CheckBox
            title="EAN 13"
            checked={ean13checked}
            onPress={() => {
              setDecoders()
              setEan13checked(!ean13checked)
            }}
          />
        </View>
        <View style={{ flexDirection: "row"}}>
          <CheckBox
            title="Code 39"
            checked={code39checked}
            onPress={() => {
              setDecoders()
              setCode39checked(!code39checked)
            }}
          />
          <CheckBox
            title="Code 128"
            checked={code128checked}
            onPress={() => {
              setDecoders()
              setCode128checked(!code128checked)
            }}
          />
        </View>
        <Text style={styles.itemHeading}>
          Scanned barcodes will be displayed here:
        </Text>

        {scans.map((item) => {
          return (
            <View
              style={{
                backgroundColor: "#0077A0",
                margin: 10,
                borderRadius: 5,
              }}
            >
              <Text style={styles.scanData}>{item.data}</Text>
              <Text style={styles.scanData}>{item.decoder}</Text>
              <Text style={styles.scanData}>{item.timeOfScan}</Text>
            </View>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

type Props = {}

interface AppState {
  ean8checked: boolean
  ean13checked: boolean
  code39checked: boolean
  code128checked: boolean
  lastApiVisible: boolean
  lastApiText: string
  checkBoxesDisabled: boolean
  scanButtonVisible: boolean
  dwVersionText: string
  dwVersionTextStyle: any
  activeProfileText: string
  enumeratedScannersText: string
  scans: Scan[]
}

// ----------------------------------- ORIGINAL CODE FROM https://github.com/darryncampbell/DataWedgeReactNative -------------------------------------------

// export default class App extends Component<Props> {
//   sendCommandResult: string = "";
//   deviceEmitterSubscription: EmitterSubscription | undefined = undefined;
//   state: AppState;
//   constructor(Props: any) {
//     super(Props);
//     this.state = {
//       ean8checked: true,
//       ean13checked: true,
//       code39checked: true,
//       code128checked: true,
//       lastApiVisible: false,
//       lastApiText: "Messages from DataWedge will go here",
//       checkBoxesDisabled: true,
//       scanButtonVisible: false,
//       dwVersionText:
//         "Pre 6.3.  Please create and configure profile manually.  See the ReadMe for more details",
//       dwVersionTextStyle: styles.itemTextAttention,
//       activeProfileText: "Requires DataWedge 6.3+",
//       enumeratedScannersText: "Requires DataWedge 6.3+",
//       scans: [],
//     };
//     //this.scans = [{decoder: 'label', timeAtDecode: 'time', data: '123'},
//     //  {decoder: 'label', timeAtDecode: 'time', data: '321'},
//     //  {decoder: 'label', timeAtDecode: 'time', data: '123'}];
//     this.sendCommandResult = "false";
//   }

//   componentDidMount() {
//     this.deviceEmitterSubscription = DeviceEventEmitter.addListener(
//       "datawedge_broadcast_intent",
//       (intent) => {
//         this.broadcastReceiver(intent);
//       }
//     );
//     this.registerBroadcastReceiver();
//     this.determineVersion();
//   }

//   componentWillUnmount() {
//     this.deviceEmitterSubscription?.remove();
//   }

//   _onPressScanButton() {
//     this.sendCommand(
//       "com.symbol.datawedge.api.SOFT_SCAN_TRIGGER",
//       "TOGGLE_SCANNING"
//     );
//   }

//   setDecoders() {
//     //  Set the new configuration
//     var profileConfig = {
//       PROFILE_NAME: "ZebraReactNativeDemo",
//       PROFILE_ENABLED: "true",
//       CONFIG_MODE: "UPDATE",
//       PLUGIN_CONFIG: {
//         PLUGIN_NAME: "BARCODE",
//         PARAM_LIST: {
//           //"current-device-id": this.selectedScannerId,
//           scanner_selection: "auto",
//           decoder_ean8: "" + this.state.ean8checked,
//           decoder_ean13: "" + this.state.ean13checked,
//           decoder_code128: "" + this.state.code128checked,
//           decoder_code39: "" + this.state.code39checked,
//         },
//       },
//     };
//     this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
//   }

//   sendCommand(extraName: string, extraValue: any) {
//     console.log(
//       "Sending Command: " + extraName + ", " + JSON.stringify(extraValue)
//     );
//     var broadcastExtras: any = {};
//     broadcastExtras[extraName] = extraValue;
//     broadcastExtras["SEND_RESULT"] = this.sendCommandResult;
//     DataWedgeIntents.sendBroadcastWithExtras({
//       action: "com.symbol.datawedge.api.ACTION",
//       extras: broadcastExtras,
//     });
//   }

//   registerBroadcastReceiver() {
//     DataWedgeIntents.registerBroadcastReceiver({
//       filterActions: [
//         "com.zebra.reactnativedemo.ACTION",
//         "com.symbol.datawedge.api.RESULT_ACTION",
//       ],
//       filterCategories: ["android.intent.category.DEFAULT"],
//     });
//   }

//   broadcastReceiver(intent: any) {
//     //  Broadcast received
//     console.log("Received Intent: " + JSON.stringify(intent));
//     if (intent.hasOwnProperty("RESULT_INFO")) {
//       var commandResult =
//         intent.RESULT +
//         " (" +
//         intent.COMMAND.substring(
//           intent.COMMAND.lastIndexOf(".") + 1,
//           intent.COMMAND.length
//         ) +
//         ")"; // + JSON.stringify(intent.RESULT_INFO);
//       this.commandReceived(commandResult.toLowerCase());
//     }

//     if (
//       intent.hasOwnProperty("com.symbol.datawedge.api.RESULT_GET_VERSION_INFO")
//     ) {
//       //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX
//       var versionInfo =
//         intent["com.symbol.datawedge.api.RESULT_GET_VERSION_INFO"];
//       console.log("Version Info: " + JSON.stringify(versionInfo));
//       var datawedgeVersion = versionInfo["DATAWEDGE"];
//       console.log("Datawedge version: " + datawedgeVersion);

//       //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
//       if (datawedgeVersion >= "06.3") this.datawedge63();
//       if (datawedgeVersion >= "06.4") this.datawedge64();
//       if (datawedgeVersion >= "06.5") this.datawedge65();

//       this.setState(this.state);
//     } else if (
//       intent.hasOwnProperty(
//         "com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS"
//       )
//     ) {
//       //  Return from our request to enumerate the available scanners
//       var enumeratedScannersObj =
//         intent["com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS"];
//       this.enumerateScanners(enumeratedScannersObj);
//     } else if (
//       intent.hasOwnProperty(
//         "com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE"
//       )
//     ) {
//       //  Return from our request to obtain the active profile
//       var activeProfileObj =
//         intent["com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE"];
//       this.activeProfile(activeProfileObj);
//     } else if (!intent.hasOwnProperty("RESULT_INFO")) {
//       //  A barcode has been scannedr
//       this.barcodeScanned(intent, new Date().toLocaleString());
//     }
//   }

//   datawedge63() {
//     console.log("Datawedge 6.3 APIs are available");
//     //  Create a profile for our application
//     this.sendCommand(
//       "com.symbol.datawedge.api.CREATE_PROFILE",
//       "ZebraReactNativeDemo"
//     );

//     this.state.dwVersionText =
//       "6.3.  Please configure profile manually.  See ReadMe for more details.";

//     //  Although we created the profile we can only configure it with DW 6.4.
//     this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

//     //  Enumerate the available scanners on the device
//     this.sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

//     //  Functionality of the scan button is available
//     this.state.scanButtonVisible = true;
//   }

//   datawedge64() {
//     console.log("Datawedge 6.4 APIs are available");

//     //  Documentation states the ability to set a profile config is only available from DW 6.4.
//     //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
//     this.state.dwVersionText = "6.4.";
//     this.state.dwVersionTextStyle = styles.itemText;
//     //document.getElementById('info_datawedgeVersion').classList.remove("attention");

//     //  Decoders are now available
//     this.state.checkBoxesDisabled = false;

//     //  Configure the created profile (associated app and keyboard plugin)
//     var profileConfig = {
//       PROFILE_NAME: "ZebraReactNativeDemo",
//       PROFILE_ENABLED: "true",
//       CONFIG_MODE: "UPDATE",
//       PLUGIN_CONFIG: {
//         PLUGIN_NAME: "BARCODE",
//         RESET_CONFIG: "true",
//         PARAM_LIST: {},
//       },
//       APP_LIST: [
//         {
//           PACKAGE_NAME: "com.datawedgereactnative.demo",
//           ACTIVITY_LIST: ["*"],
//         },
//       ],
//     };
//     this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

//     //  Configure the created profile (intent plugin)
//     var profileConfig2 = {
//       PROFILE_NAME: "ZebraReactNativeDemo",
//       PROFILE_ENABLED: "true",
//       CONFIG_MODE: "UPDATE",
//       PLUGIN_CONFIG: {
//         PLUGIN_NAME: "INTENT",
//         RESET_CONFIG: "true",
//         PARAM_LIST: {
//           intent_output_enabled: "true",
//           intent_action: "com.zebra.reactnativedemo.ACTION",
//           intent_delivery: "2",
//         },
//       },
//     };
//     this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

//     //  Give some time for the profile to settle then query its value
//     setTimeout(() => {
//       this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
//     }, 1000);
//   }

//   datawedge65() {
//     console.log("Datawedge 6.5 APIs are available");

//     this.state.dwVersionText = "6.5 or higher.";

//     //  Instruct the API to send
//     this.sendCommandResult = "true";
//     this.state.lastApiVisible = true;
//   }

//   commandReceived(commandText: string) {
//     this.state.lastApiText = commandText;
//     this.setState(this.state);
//   }

//   enumerateScanners(enumeratedScanners: any) {
//     var humanReadableScannerList = "";
//     for (var i = 0; i < enumeratedScanners.length; i++) {
//       console.log(
//         "Scanner found: name= " +
//           enumeratedScanners[i].SCANNER_NAME +
//           ", id=" +
//           enumeratedScanners[i].SCANNER_INDEX +
//           ", connected=" +
//           enumeratedScanners[i].SCANNER_CONNECTION_STATE
//       );
//       humanReadableScannerList += enumeratedScanners[i].SCANNER_NAME;
//       if (i < enumeratedScanners.length - 1) humanReadableScannerList += ", ";
//     }
//     this.state.enumeratedScannersText = humanReadableScannerList;
//   }

//   activeProfile(theActiveProfile: string) {
//     this.state.activeProfileText = theActiveProfile;
//     this.setState(this.state);
//   }

//   barcodeScanned(scanData: any, timeOfScan: string) {
//     var scannedData = scanData["com.symbol.datawedge.data_string"];
//     var scannedType = scanData["com.symbol.datawedge.label_type"];
//     console.log("Scan: " + scannedData);
//     this.state.scans.unshift({
//       data: scannedData,
//       decoder: scannedType,
//       timeAtDecode: timeOfScan,
//     });
//     console.log(this.state.scans);
//     this.setState(this.state);
//   }

//   render() {
//     return (
//       <SafeAreaView style={{ flex: 1 }}>
//         <View style={styles.container}>
//           <Text style={styles.h1}>Zebra ReactNative DataWedge Demo</Text>
//           <Text style={styles.h3}>Information / Configuration</Text>
//           <Text style={styles.itemHeading}>DataWedge version:</Text>
//           <Text style={this.state.dwVersionTextStyle}>
//             {this.state.dwVersionText}
//           </Text>
//           <Text style={styles.itemHeading}>Active Profile</Text>
//           <Text style={styles.itemText}>{this.state.activeProfileText}</Text>
//           {this.state.lastApiVisible && (
//             <Text style={styles.itemHeading}>Last API message</Text>
//           )}
//           {this.state.lastApiVisible && (
//             <Text style={styles.itemText}>{this.state.lastApiText}</Text>
//           )}
//           <Text style={styles.itemHeading}>Available scanners:</Text>
//           <Text style={styles.itemText}>
//             {this.state.enumeratedScannersText}
//           </Text>
//           <View style={{ flexDirection: "row", flex: 1 }}>
//             <CheckBox
//               title="EAN 8"
//               checked={this.state.ean8checked}
//               disabled={this.state.checkBoxesDisabled}
//               onPress={() => {
//                 this.state.ean8checked = !this.state.ean8checked;
//                 this.setDecoders();
//                 this.setState(this.state);
//               }}
//             />
//             <CheckBox
//               title="EAN 13"
//               checked={this.state.ean13checked}
//               disabled={this.state.checkBoxesDisabled}
//               onPress={() => {
//                 this.state.ean13checked = !this.state.ean13checked;
//                 this.setDecoders();
//                 this.setState(this.state);
//               }}
//             />
//           </View>
//           <View style={{ flexDirection: "row", flex: 1 }}>
//             <CheckBox
//               title="Code 39"
//               checked={this.state.code39checked}
//               disabled={this.state.checkBoxesDisabled}
//               onPress={() => {
//                 this.state.code39checked = !this.state.code39checked;
//                 this.setDecoders();
//                 this.setState(this.state);
//               }}
//             />
//             <CheckBox
//               title="Code 128"
//               checked={this.state.code128checked}
//               disabled={this.state.checkBoxesDisabled}
//               onPress={() => {
//                 this.state.code128checked = !this.state.code128checked;
//                 this.setDecoders();
//                 this.setState(this.state);
//               }}
//             />
//           </View>
//           {this.state.scanButtonVisible && (
//             <Button
//               title="Scan"
//               buttonStyle={{
//                 backgroundColor: "#ffd200",
//                 height: 45,
//                 borderColor: "transparent",
//                 borderWidth: 0,
//                 borderRadius: 5,
//               }}
//               onPress={() => {
//                 this._onPressScanButton();
//               }}
//             />
//           )}

//           <Text style={styles.itemHeading}>
//             Scanned barcodes will be displayed here:
//           </Text>

//           <FlatList
//             data={this.state.scans}
//             extraData={this.state}
//             renderItem={({ item, separators }) => (
//               <TouchableHighlight
//                 onShowUnderlay={separators.highlight}
//                 onHideUnderlay={separators.unhighlight}
//               >
//                 <View
//                   style={{
//                     backgroundColor: "#0077A0",
//                     margin: 10,
//                     borderRadius: 5,
//                   }}
//                 >
//                   <View style={{ flexDirection: "row", flex: 1 }}>
//                     <Text style={styles.scanDataHead}>{item.decoder}</Text>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.scanDataHeadRight}>
//                         {item.timeAtDecode}
//                       </Text>
//                     </View>
//                   </View>
//                   <Text style={styles.scanData}>{item.data}</Text>
//                 </View>
//               </TouchableHighlight>
//             )}
//           />
//         </View>
//       </SafeAreaView>
//     );
//   }
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //    justifyContent: 'center',
    //    alignItems: 'center',
    backgroundColor: "#F5FCFF",
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5,
  },
  h1: {
    fontSize: 20,
    textAlign: "center",
    margin: 5,
    fontWeight: "bold",
  },
  h3: {
    fontSize: 14,
    textAlign: "center",
    margin: 10,
    fontWeight: "bold",
  },
  itemHeading: {
    fontSize: 12,
    textAlign: "left",
    left: 10,
    fontWeight: "bold",
  },
  itemText: {
    fontSize: 12,
    textAlign: "left",
    margin: 10,
  },
  itemTextAttention: {
    fontSize: 12,
    textAlign: "left",
    margin: 10,
    backgroundColor: "#ffd200",
  },
  scanDataHead: {
    fontSize: 10,
    margin: 2,
    fontWeight: "bold",
    color: "white",
  },
  scanDataHeadRight: {
    fontSize: 10,
    margin: 2,
    textAlign: "right",
    fontWeight: "bold",
    color: "white",
  },
  scanData: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    margin: 2,
    color: "white",
  },
});
