/*******************************************************************************
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io) and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *******************************************************************************/
import { Container, ContainerModule } from "inversify"
import {
    TYPES, ViewRegistry, defaultModule, boundsModule, fadeModule, viewportModule, selectModule, moveModule, hoverModule,
    LocalModelSource, SGraphView, ConsoleLogger, LogLevel, overrideViewerOptions
} from "sprotty/lib"
import { ElkNodeView, ElkPortView, ElkEdgeView, ElkLabelView } from "./views"
import { ElkGraphFactory } from "./model"
import LanguageDiagramServer from "./language-diagram-server"

export default (source: 'local' | 'remote') => {
    const elkGraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn)
        rebind(TYPES.IModelFactory).to(ElkGraphFactory).inSingletonScope()
        switch (source) {
            case 'local':
                bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()
                break
            case 'remote':
                bind(TYPES.ModelSource).to(LanguageDiagramServer).inSingletonScope()
                break
        }
    })
    const container = new Container()
    container.load(defaultModule, selectModule, boundsModule, moveModule, fadeModule, hoverModule, viewportModule, elkGraphModule)
    overrideViewerOptions(container, {
        needsClientLayout: false
    })

    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node', ElkNodeView)
    viewRegistry.register('port', ElkPortView)
    viewRegistry.register('edge', ElkEdgeView)
    viewRegistry.register('label', ElkLabelView)

    return container
}
