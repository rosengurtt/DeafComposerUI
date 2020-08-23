declare var window: any;

export class DynamicEnvironment {
    public GetEnvironment(){
        return window.config;
    }
}