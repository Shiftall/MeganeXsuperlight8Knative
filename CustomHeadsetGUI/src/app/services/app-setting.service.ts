import { Injectable, signal } from '@angular/core';
import { AppSetting } from './JsonFileDefines';
import { PathsService } from './paths.service';
import { JsonSettingServiceBase } from './JsonSettingServiceBase';

@Injectable({
  providedIn: 'root'
})
export class AppSettingService extends JsonSettingServiceBase<AppSetting> {
  constructor(paths: PathsService) {
    super(paths.guiSettingPath, paths.appDataDirPath, signal({
      colorScheme: 'system',
      updateMode: 'rewrite',
      advanceMode: false
    }), true, true)
  }
}
