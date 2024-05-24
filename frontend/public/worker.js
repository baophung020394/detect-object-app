// public/worker.js

self.onmessage = function(event) {
  const { imageData, previousImageData } = event.data;
  const diff = calculateFrameDifference(previousImageData, imageData);
  self.postMessage({ diff, imageData });
};

function calculateFrameDifference(frame1, frame2) {
  if (!frame1 || !frame2) {
    return 1; // Nếu không có khung hình trước đó, coi như có sự khác biệt lớn
  }

  let diff = 0;
  for (let i = 0; i < frame1.data.length; i += 4) {
    const rDiff = Math.abs(frame1.data[i] - frame2.data[i]);
    const gDiff = Math.abs(frame1.data[i + 1] - frame2.data[i + 1]);
    const bDiff = Math.abs(frame1.data[i + 2] - frame2.data[i + 2]);
    diff += (rDiff + gDiff + bDiff) / 3;
  }
  return diff / (frame1.data.length / 4);
}
