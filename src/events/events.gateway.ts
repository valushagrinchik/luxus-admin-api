import { Inject, Logger, LoggerService } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  // WsResponse,
} from '@nestjs/websockets';
// import { from, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway({
  // cors: {
  //   origin: '*',
  // },
  // transports: ['websocket'],
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    // private prisma: PrismaService,
  ) {}

  @WebSocketServer()
  io: Server;

  afterInit() {
    this.logger.log('Initialized');
  }

  handleConnection(client: any) {
    const { sockets } = this.io.sockets;

    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('actions')
  handleMessage(client: any, data: any) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${data}`);
    this.io.emit('actions', data);
  }
}
