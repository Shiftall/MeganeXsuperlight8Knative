export type DistortionProfileConfig = {
  name: string;
  description: string;
  modifiedTime: number;
  type: string;
  distortions: number[];
  distortionsRed: number[];
  distortionsBlue: number[];
};
export type Settings = {
  watchDistortionProfiles: boolean,
  meganeX8K: MeganeX8KConfig,
  customShader: CustomShaderConfig
}
export type StationaryDimmingConfig = {
  enable: boolean,
  movementThreshold: number,
  movementTime: number,
  dimBrightnessPercent: number,
  dimSeconds: number,
  brightenSeconds: number
}
export type HiddenAreaMeshConfig = {
  /**
   * If hidden area meshes should be used.
   */
  enable: boolean;
  /**
   * "Inverts" the hidden area meshes and increases the black level.
   * This makes it easy to see how large the hidden are mesh is.
   */
  testMode: boolean;
  /**
   * How many points should be used for each rounded corner.
   */
  detailLevel: number;
  /**
   * Top outer corner radius, as a fraction the cropped display area.
   */
  radiusTopOuter: number;
  /**
   * Top inner corner radius, as a fraction the cropped display area.
   */
  radiusTopInner: number;
  /**
   * Bottom inner corner radius, as a fraction the cropped display area.
   */
  radiusBottomInner: number;
  /**
   * Bottom outer corner radius, as a fraction the cropped display area.
   */
  radiusBottomOuter: number;
};
export type CustomShaderConfig = {
  enable: boolean;
  enableForMeganeX8K: boolean,
  enableForOther: boolean,
  contrast: number;
  contrastMidpoint: number;
  contrastLinear: boolean;
  chroma: number;
  gamma: number;
}

export type MeganeX8KConfig = {
  /**
   * if the MeganeX superlight 8K should be shimmed by this driver
   */
  enable: boolean;

  /**
   * ipd in mm
   */
  ipd: number;

  /**
   * ipd offset from the ipd value in mm
   */
  ipdOffset: number;

  /**
   * minimum black levels from 0 to 1
   */
  blackLevel: number;

  /**
   * distortion profile to use
   */
  distortionProfile: string;

  /**
   * amount to zoom in the distortion profile
   */
  distortionZoom: number;

  /**
   * amount to shift the subpixels to account for their different rows
   */
  subpixelShift: number;

  resolutionX: number;

  resolutionY: number;

  maxFovX: number;

  maxFovY: number;

  distortionMeshResolution: number;

  fovBurnInPrevention: boolean;

  renderResolutionMultiplierX: number;

  renderResolutionMultiplierY: number;

  hiddenArea: HiddenAreaMeshConfig;
  stationaryDimming: StationaryDimmingConfig;
};

export type AppSetting = {
  colorScheme: 'system' | 'dark' | 'light';
  updateMode: 'replace' | 'rewrite';
  advanceMode: boolean
}

export type DriverInfo = {
  about: string;
  defaultSettings: Settings;
  builtInDistortionProfiles: BuiltInDistortionProfiles;
  resolution: ResolutionInfo,
  driverVersion: string
}
export type ResolutionInfo = {
  renderResolution1To1X: number,
  renderResolution1To1Y: number,
  renderResolution1To1Percent: number,
  renderResolution100PercentX: number,
  renderResolution100PercentY: number
}

export type BuiltInDistortionProfiles = {
  [profileName: string]: {};
}
