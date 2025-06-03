
import { effect, Signal, signal } from '@angular/core';
import { exists, mkdir, readTextFile, watchImmediate, writeTextFile } from '@tauri-apps/plugin-fs';
import { cleanJsonComments, DebouncedFileWriter, debouncedFileWriter, deepCopy, deepMerge } from '../helpers';
import { debounceTime, delay, filter, Subject } from 'rxjs';
export enum FileReadErrorReason {
    NotExists = 'File not exists',
    ParsingFailed = 'Parsing failed'
}
export type FileReadError = {
    reason: FileReadErrorReason,
    message?: string
}
export abstract class JsonSettingServiceBase<T> {
    protected _values = signal<T | undefined>(undefined, {});
    public values = this._values.asReadonly();
    protected readonly debouncedFileWriter: DebouncedFileWriter;
    protected _initTask: Promise<void>;
    public get initTask() {
        return this._initTask;
    }
    protected _readFileError = signal<FileReadError | undefined>(undefined);
    public readFileError = this._readFileError.asReadonly();
    protected defaults?: T;
    public get filePath() {
        return this._filePath;
    }
    constructor(
        private _filePath: string,
        private _fileDir: string,
        private defaultValue: Signal<T | undefined>,
        private autoCreate: boolean,
        private watchFileforAutoReload: boolean) {
        this.debouncedFileWriter = debouncedFileWriter(_filePath, _fileDir);
        this._initTask = this.init();
        effect(() => {
            this.defaults = (this.defaultValue() ?? {} as any)
            this.loadSetting()
        });
    }
    protected async init() {
        if (!await exists(this._fileDir)) {
            await mkdir(this._fileDir);
        }
        if (!await exists(this._filePath) && this.autoCreate) {
            await writeTextFile(this._filePath, JSON.stringify("{}"));
        }
        if (this.watchFileforAutoReload) {
            const watchSubject = new Subject<void>();
            watchSubject.pipe(filter(() => !this.debouncedFileWriter.isSavingFile()), debounceTime(25), delay(25)).subscribe(() => {
                this.loadSetting();
            });
            watchImmediate(this._fileDir, ev => {
                if (ev.paths.some(p => p == this._filePath)) {
                    watchSubject.next();
                }
            });
            watchSubject.next();
        } else {
            await this.loadSetting();
        }

    }
    loading = false
    async loadSetting() {
        if (this.loading) return;
        this.loading = true
        try {
            if (await exists(this._filePath)) {
                try {
                    const copiedDefaults = deepCopy(this.defaults);
                    this._values.set(deepMerge(copiedDefaults as any, JSON.parse(cleanJsonComments(await readTextFile(this._filePath)))));
                    this._readFileError.set(undefined);
                } catch (e) {
                    this._readFileError.set({
                        reason: FileReadErrorReason.ParsingFailed,
                        message: `${e}`
                    });
                    this._values.set(undefined);
                }
            } else {
                this._readFileError.set({ reason: FileReadErrorReason.NotExists });
                this._values.set(undefined)
            }
        } finally {
            this.loading = false
        }
    }

    async save(values: T) {
        await this._initTask;
        this.debouncedFileWriter.save(JSON.stringify(deepCopy(values, this.defaults ?? {}), undefined, 4));
        this._values.set(Object.assign({}, values))
    }
}