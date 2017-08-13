import { Container } from "inversify";
import UTILS from "../utils/toolsType";
import CONST from "./constantes";
import { FileSystemUtil, IFileSystem } from "../utils/fileSystemUtils";
import { HTTPUtils, IHTTPUtils } from "../utils/httpUtils";
import { IDatabase, Database } from "../data/database";
import { IRoute } from "../routes/route";
import ROUTE_TYPE from "../routes/route";
import { AppRoute } from "../routes/application";
import { IMetadataExtractor, IMetadataExtractorExecutor, MetadataExtractorExecutor } from "../metadataExtractor/metadataExtractor";
import { TheMovieDatabaseMetadataExtractor } from "../metadataExtractor/theMovieDatabase";
import { FfmpegMetadataExtractor } from "../metadataExtractor/ffmpefMetadataExtractor";

var container = new Container();
container.bind<String>(CONST.dbPath).toConstantValue("./.mediacenter/db/mediacenter");
container.bind<IDatabase>("movies").to(Database);

container.bind<IFileSystem>(UTILS.FsUTils).to(FileSystemUtil);
container.bind<IHTTPUtils>(UTILS.HTTPUtils).to(HTTPUtils);
container.bind<IRoute>(ROUTE_TYPE.App).to(AppRoute);

// Extractor executor
container.bind<IMetadataExtractorExecutor>("extractorsExecutor").to(MetadataExtractorExecutor);

// Extractors
container.bind<IMetadataExtractor>("extractors").to(FfmpegMetadataExtractor);
container.bind<IMetadataExtractor>("extractors").to(TheMovieDatabaseMetadataExtractor);

export default container;