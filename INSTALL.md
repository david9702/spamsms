# Installation

## 1. Kopiera filerna
Kopiera innehållet i denna zip till ditt spamsms-projekt (överskriver befintliga filer).

## 2. Uppdatera MainApplication.kt
I `android/app/src/main/java/com/spamsms/app/MainApplication.kt`, lägg till i getPackages():

```kotlin
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add(DirectSmsPackage())
    }
```

## 3. Uppdatera AndroidManifest.xml
I `android/app/src/main/AndroidManifest.xml`, lägg till:

```xml
<uses-permission android:name="android.permission.SEND_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
```

## 4. Uppdatera SendingScreen.tsx
Byt openSmsComposer mot sendSmsSequence. Be om permissions innan:

```typescript
import { PermissionsAndroid, NativeModules } from 'react-native';

const granted = await PermissionsAndroid.requestMultiple([
  PermissionsAndroid.PERMISSIONS.SEND_SMS,
  PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
]);

await NativeModules.SmsReceiver.startListening();
await sendSmsSequence(draft, delayMs, emojisOn, chaosOn, safeword, onProgress);
await NativeModules.SmsReceiver.stopListening();
```

## 5. Bygg och kör
```bash
npx react-native run-android
```
