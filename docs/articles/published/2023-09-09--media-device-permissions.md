---
title: Media Device Permissions
date: 2023-09-09
---

Media device permissions in the browser are a tricky beast, and the levels of support also differ across browsers. This article covers some of the basics of identifying device permissions, and also calls out a few of the challenges you're likely to face during implementation.

---

## Device Availability vs Permission

There are two levels of device availability:

1. The user **has** a camera or microphone
2. The user **has granted permission** to their camera or microphone

This is an important differentiation, because if a user has already granted permissions in a previous session then you can easily go ahead with accessing those devices.

If the user has never given permission, or their permissions have been reset, then you will need to set them up for success by setting expectations about the request for device access before it happens.

## Identify Available Devices

It can be useful to fetch a list of devices up-front so that you know what you have available to work with.

### enumerateDevices()

The `enumerateDevices()` function will return you a list of all media devices, as well as the browser can manage with the current level of permissions granted by the user.

```ts
const allDevices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
```

### MediaDeviceInfo

The `enumerateDevices()` function returns an array of `MediaDeviceInfo` objects, one for each device.

The `MediaDeviceInfo` type has the following shape:

```ts
type MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  label: string;
}
```

When a user has not granted permission to access devices, the `MediaDeviceInfo` objects will have very little detail.

For example, here is the full result for all devices on a Mac, when permission has not yet been granted:

```json
[
    {
        "deviceId": "",
        "kind": "audioinput",
        "label": "",
        "groupId": ""
    },
    {
        "deviceId": "",
        "kind": "videoinput",
        "label": "",
        "groupId": ""
    },
    {
        "deviceId": "",
        "kind": "audiooutput",
        "label": "",
        "groupId": ""
    }
]
```

From this result, you can still identify that the user _has_ a camera, microphone, and also speakers (`audiooutput`). However, you can not identify any more information about those devices, such as how many of each kind, or the name (`label`) that the user would identify them by.

After a user has granted permissions, the result is much more detailed. The following example has all devices collapsed except the first one, for easier reading:

```json
[
    {
        "deviceId": "default",
        "kind": "audioinput",
        "label": "Default - MacBook Pro Microphone (Built-in)",
        "groupId": "76a975a9ac51c7ce127e121fb69aac7ed0eed75aac876dcd7ea4ccda63216014"
    },
    { "deviceId": "7b3e8...", "kind": "audioinput", "label": "MacBook Pro Microphone (Built-in)","groupId": "76a97..." },
    { "deviceId": "04d2b...", "kind": "videoinput", "label": "OBS Virtual Camera (m-de:vice)", "groupId": "251b2..." },
    { "deviceId": "default", "kind": "audiooutput", "label": "Default - External Headphones (Built-in)", "groupId": "98dde..." },
    { "deviceId": "ded42...", "kind": "audiooutput", "label": "External Headphones (Built-in)", "groupId": "98dde..." },
    { "deviceId": "72850...", "kind": "audiooutput", "label": "MacBook Pro Speakers (Built-in)", "groupId": "76a97..." }
]

```

### Grouping devices by kind

Once you have a list of all devices, you can split them into separate device groups easily by filtering on the `kind` of the device.

This may be useful if you want to allow the user to select exactly which device they'd like to use, from a drop-down menu or similar.

```ts
const allDevices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

const cameras = allDevices.filter((device) => device.kind === 'videoinput');
const microphones = allDevices.filter((device) => device.kind === 'audioinput');
```

### Device presence

The cool thing about `enumerateDevices()` is how it still gives a device list even if permissions have not yet been granted. We can use that basic list to determine if there is _any_ device at all of a certain type.

This will allow us to identify the edge case of a user not having a camera at all (or not having a microphone at all) and ensure that our app does not try to request permission for a device that is not even present.

```ts
const allDevices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

const cameras = allDevices.filter((device) => device.kind === 'videoinput');
const microphones = allDevices.filter((device) => device.kind === 'audioinput');

const cameraAvailable = cameras.length > 0;
const microphoneAvailable = microphones.length > 0;
```

## Identify Device Permissions

The permissions on a device represent whether the user has allowed your app access or not. Once you've been granted permissions, you can access the cam or mic at any time without additional prompts to the user.

### Simple permissions state

We can use the presence of `MediaDeviceInfo` details to figure out if we have already been granted permissions for a particular device type.

The simplest way is to check the `deviceId` for a non-falsy value, since the `deviceId` will be an empty string if permissions have not been granted:

```ts
const allDevices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

const cameras = allDevices.filter((device) => device.kind === 'videoinput');
const microphones = allDevices.filter((device) => device.kind === 'audioinput');

const cameraPermissionGranted = cameras.some((device) => !!device.deviceId);
const microphonePermissionGranted = microphones.some(
  (device) => !!device.deviceId
);
```

### Permissions API [limited support]

There is a new [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions) for identifying device permissions state, but you may find that it's not supported on all browsers. Also, you may find that your version of TypeScript does not have the type definitions for the Permissions API, causing red squiggly warnings for code which will be valid in the browser.

At time of writing, the most notable support limitations are:

- The API is [not supported by Android Webview](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API#browser_compatibility), which means that it won't work on any website opened via an Android app -- for example a link opened from an email or from a social media post.
- [Firefox](https://searchfox.org/mozilla-central/source/dom/webidl/Permissions.webidl#10) does not include `camera` or `microphone` as accepted `name` values for querying.

Querying permissions with the new API can be done like this:

```ts
const cameraPermissionState = await navigator.permissions
  .query({ name: "camera" })
  .then((permissionStatus) => permissionStatus.state);

const microphonePermissionState = await navigator.permissions
  .query({ name: "microphone" })
  .then((permissionStatus) => permissionStatus.state);
```

The `query()` function returns a [`PermissionStatus`](https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus) object with the following shape:

```ts
type PermissionStatus {
  name: PermissionName; // eg. 'camera' or 'microphone'
  state: 'granted' | 'denied' | 'prompt';
}
```

The `name` will be the same as the `name` value passed in to the `query()`.

The `state` represents the current state of permissions for the particular feature (device) that was queried:

- `granted`: The user has already granted permission to the device.
- `denied`: The user has explicity denied permission, and you can not prompt for access.
- `prompt`: Your application may choose to prompt the user for access to the device.

Unfortunately, at this stage each browser supports a different set of values for the `name` property. If you need, you can view the exact supported values for [Firefox](https://searchfox.org/mozilla-central/source/dom/webidl/Permissions.webidl#10), [Chromium](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/modules/permissions/permission_descriptor.idl), and [WebKit](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/permissions/PermissionName.idl). Links sourced from [Permissions: query() method](https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query) docs on MDN.

### Future-proofed permissions state

It may be a good idea to align your implementation with the Permissions API even if you choose not to use the API directly. For example, it may be a good idea to adopt the `PermissionState` type even if you are implementing the logic yourself.

The `PermissionState` is one of `'granted'`, `'denied'`, or `'prompt'`. You could adapt your `enumerateDevices()` usage to return these states as the result:

```ts
const allDevices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

const cameras = allDevices.filter((device) => device.kind === 'videoinput');
const microphones = allDevices.filter((device) => device.kind === 'audioinput');

const cameraPermissionState: PermissionState =
  cameras.some((device) => !!device.deviceId)
    ? 'granted'
    : 'prompt';

const microphonePermissionState: PermissionState =
  microphones.some((device) => !!device.deviceId)
    ? 'granted'
    : 'prompt';

```

This approach does not give you any way to identify the third state of `'denied'`, but that particular state can still be identified within the error handler of the code that attempts to request access to the devices.

The above states at least give you an indication of "yes, you have permission" vs "no, you don't have permission" within a more future-proofed format aligned with the Permissions API.

## Accessing Devices

### Request device permissions

The user will be prompted for permission to access a device when your code makes a call to `getUserMedia()` with constraints that include either audio or video.

### Create a MediaStream

The `getUserMedia()` function requests access to devices, and then uses those devices to create a `MediaStream` consisting of the user's audio and/or video.

The function returns a `Promise`. If the user approves access to devices, the `Promise` resolves to a `MediaStream`. If they decline access, ignore the device access popup, or any other issue happens with creating the `MediaStream`, then the `Promise` will reject with an error.

A request to `getUserMedia()` must be given a set of `MediaStreamConstraints` so that it knows which devices to request access for.

```ts
const constraints: MediaStreamConstraints = { audio: true, video: true };
const stream: MediaStream = navigator.mediaDevices.getUserMedia(constraints);
```

The permission prompt will only be shown if the user has not previously granted access to one or more of the devices types specified in the constraints.

### Handling Errors

If the user declines access, or some other issue occurs with the `getUserMedia()` request, then the `MediaStream` will not be created. The `getUserMedia()` function returns a Promise, so you can check for success or failure of the request.

```ts
const constraints: MediaStreamConstraints = { audio: true, video: true };
const stream: MediaStream = navigator.mediaDevices
  .getUserMedia(constraints)
  .catch((e) => console.log('Failed to create MediaStream', e));
```

There are two types of error which may occur:

- `TypeError` when the constraints are not valid
- `DOMException` when anything else goes wrong

The `TypeError` only occurs when the constraints are not valid, while the `DOMException` may happen for a number of reasons. You may like to check the error type in more detail to determine if there is any messaging that could be passed along to the user, or handled in your own code.

```ts
function onUserMediaError(e: DOMException | TypeError) {

  if (e instanceOf TypeError) {
    console.log('invalid media stream constraints, or site is not secure (https)');
    return;
  }

  if (e instanceof DOMException) {
    switch(e.name) {
      case 'NotAllowedError':
        console.log('one or more requested devices are not allowed to be accessed');
        break;
      case 'NotFoundError':
        console.log('one or more requested device types are not available');
        break;
      case 'OverconstrainedError':
        console.log('can not fulfill the required constraints');
        break;
      case 'SecurityError':
        console.log('media support is not allowed for the current document');
        break;
      case 'AbortError':
        console.log('an unknown system error occurred when accessing a device');
        break;
      default:
        console.log('an unknown error occurred', e);
    }
  }
}
```
