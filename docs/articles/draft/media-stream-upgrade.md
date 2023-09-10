---
title: Media Stream Upgrade
date: 2023-09-09
---

## Initial State

When the page loads, we want to create a MediaStream with only the devices we already have permission to use.

```ts

```

## Create a Media Stream

When the page loads, we need to create a `MediaStream` which will persist for the life time of the page. This `MediaStream` will have its audio and video tracks modified as the user turns their camera or mic on and off.

### Identify initial permissions

First, we need to identify if we already have permission to use the camera and/or microphone:

```ts
// list all devices
const allDevices: MediaDeviceInfo[] =
  await navigator.mediaDevices.enumerateDevices();

// check if we have mic permission already
const microphonePermitted = allDevices.some(
  (device) => device.kind == 'audioinput' && device.deviceId !== ''
);

// check if we have camera permission already
const cameraPermitted = allDevices.some(
  (device) => device.kind == 'videoinput' && device.deviceId !== ''
);
```

The `enumerateDevices()` function will give a list of available devices, with varying levels of detail depending on whether permission has been granted by the user.

If permission has been granted for a certain device type, then those devices will have a non-empty `deviceId` value. We can use this information to figure out if permission has previously been granted for either the camera (`videoinput`) or microphone (`audioinput`).

### Define initial constraints

Using the permissions information, we can define a set of `MediaStreamConstraints` that will _only_ request devices where permission has _already_ been granted.

This means the user will not see any popup prompt asking them to grant permission for their devices.

```ts
const constraints: MediaStreamConstraints = {
  audio: microphonePermitted,
  video: cameraPermitted,
};
```

// define the constraints with audio and video
// only set to true if we have permission to use them

### Construct MediaStream

// create the media stream depending on
// the available permissions.
// calling getUserMedia with both audio
// and video set to false will result
// in an error.

```ts
if (constraints.audio || constraints.video) {
  console.log('requesting media stream with', constraints);
  stream = await navigator.mediaDevices.getUserMedia(constraints);
} else {
  console.log('creating empty media stream');
  stream = new MediaStream();
}
```

We must use this if/else condition to avoid a `TypeError`.

Defining a set of `MediaStreamConstraints` where both `audio` and `video` are set to `false` is considered invalid, and calling `getUserMedia()` with those invalid constraints will result in a `TypeError`.

## Considerations

When using bluetooth audio, the user may experience a "popping" noise and a change in audio quality when the microphone audio track is added/removed from the `MediaStream`.

To avoid this issue, you may with to keep the audio track active and connected to the microphone, but add/remove the track from the MediaStream.
