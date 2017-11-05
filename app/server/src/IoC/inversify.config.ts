import { Container } from "inversify";
import UTILS from "../utils/toolsType";
import CONST from "./constantes";
import { FileSystemUtil, IFileSystem } from "../utils/fileSystemUtils";
import { HTTPUtils, IHTTPUtils } from "../utils/httpUtils";
import { IDatabase, Database } from "../services/data/database";
import { IRoute } from "../routes/route";
import ROUTE_TYPE from "../routes/route";
import { AppRoute } from "../routes/application";
import { IMetadataExtractor, IMetadataExtractorExecutor, MetadataExtractorExecutor } from "../metadataExtractor/metadataExtractor";
import { TheMovieDatabaseMetadataExtractor } from "../metadataExtractor/theMovieDatabase";
import { FfmpegMetadataExtractor } from "../metadataExtractor/ffmpefMetadataExtractor";
import { TitleFromFileExtractor } from "../metadataExtractor/titleFromFileExtractor";
import { IUpnpService, DefaultUpnpService } from "../services/upnp/upnpService";
import { UpnpRoute } from "../routes/upnpRoutes";
import { StaticRoute } from "../routes/static";

var container = new Container();
container.bind<String>(CONST.dbPath).toConstantValue("./.mediacenter/db/mediacenter");
container.bind<IDatabase>("movies").to(Database).inSingletonScope();

container.bind<IFileSystem>(UTILS.FsUTils).to(FileSystemUtil);
container.bind<IHTTPUtils>(UTILS.HTTPUtils).to(HTTPUtils);

//routes
container.bind<IRoute>(ROUTE_TYPE.App).to(StaticRoute);
container.bind<IRoute>(ROUTE_TYPE.App).to(AppRoute);
container.bind<IRoute>(ROUTE_TYPE.App).to(UpnpRoute);

// Extractor executor
container.bind<IMetadataExtractorExecutor>("extractorsExecutor").to(MetadataExtractorExecutor);

// Extractors
container.bind<IMetadataExtractor>("extractors").to(FfmpegMetadataExtractor);
container.bind<IMetadataExtractor>("extractors").to(TitleFromFileExtractor);
container.bind<IMetadataExtractor>("extractors").to(TheMovieDatabaseMetadataExtractor);

// upnp service
container.bind<IUpnpService>("upnp").to(DefaultUpnpService).inSingletonScope();

export default container;