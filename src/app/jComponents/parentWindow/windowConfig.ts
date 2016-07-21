export class WindowConfig {
    static LIST={
        'about':{title:'About us', width:600, height:400, loader:()=>require('../../about/about.component').AboutComponent},
        'form':{title:'Sample Form', width:900, height:520, loader:()=>require('../../home/home.component').HomeComponent},
        'grid':{title:'Sample Grid', width:800, height:400, loader:()=>require('../../settings/grid/grid').gridExample}
    }
}