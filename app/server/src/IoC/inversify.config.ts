import { Container } from "inversify";
import UTILS from "../utils/toolsType";
import { FileSystemUtil, IFileSystem } from "../utils/fileSystemUtils";
import { HTTPUtils, IHTTPUtils } from "../utils/httpUtils";
import { IMovies, MoviesRepository } from "../services/data/movies";
import { ISettings, SettingsRepository } from "../services/data/settings";
import { IRoute } from "../routes/route";
import { AppRoute } from "../routes/application";
import { IMetadataExtractor, IMetadataExtractorExecutor, MetadataExtractorExecutor } from "../metadataExtractor/metadataExtractor";
import { TheMovieDatabaseMetadataExtractor } from "../metadataExtractor/theMovieDatabase";
import { FfmpegMetadataExtractor } from "../metadataExtractor/ffmpefMetadataExtractor";
import { TitleFromFileExtractor } from "../metadataExtractor/titleFromFileExtractor";
import { IUpnpService, DefaultUpnpService } from "../services/upnp/upnpService";
import { UpnpRoute } from "../routes/upnpRoutes";
import { StaticRoute } from "../routes/static";
import { SettingsRoute } from "../routes/settings";
import { ISlave, SlaveService } from "../services/slave/slaveService";
import { SlaveRoute } from "../routes/slaveApplication";
import { ISlaveHealthCheck, SlaveHealthCheck } from "../services/slave/slaveHealthCheck";
let CONST = require("../IoC/constantes");

var container = new Container();

container.bind<IMovies>("movies").toDynamicValue(() => new MoviesRepository(false)).inSingletonScope();
container.bind<IMovies>("slavemovies").toDynamicValue(() => new MoviesRepository(true)).inSingletonScope();
container.bind<ISettings>("settings").to(SettingsRepository).inSingletonScope();

container.bind<IFileSystem>(UTILS.FsUTils).to(FileSystemUtil);
container.bind<IHTTPUtils>(UTILS.HTTPUtils).to(HTTPUtils);

//routes
container.bind<IRoute>(CONST.ROUTES_COMPONENTS).to(StaticRoute);
container.bind<IRoute>(CONST.ROUTES_COMPONENTS).to(AppRoute);
container.bind<IRoute>(CONST.ROUTES_COMPONENTS).to(UpnpRoute);
container.bind<IRoute>(CONST.ROUTES_COMPONENTS).to(SettingsRoute);
container.bind<IRoute>(CONST.ROUTES_COMPONENTS).to(SlaveRoute);

// Extractor executor
container.bind<IMetadataExtractorExecutor>("extractorsExecutor").to(MetadataExtractorExecutor);

// Extractors
// container.bind<IMetadataExtractor>("extractors").to(FfmpegMetadataExtractor); // usefull only on local...
container.bind<IMetadataExtractor>("extractors").to(TitleFromFileExtractor);
container.bind<IMetadataExtractor>("extractors").to(TheMovieDatabaseMetadataExtractor);

// upnp service
container.bind<IUpnpService>("upnp").to(DefaultUpnpService).inSingletonScope();

// slave service for communication
container.bind<ISlave>("slave").to(SlaveService).inSingletonScope();
container.bind<ISlaveHealthCheck>("slaveHealthCheck").to(SlaveHealthCheck).inSingletonScope();

export default container;