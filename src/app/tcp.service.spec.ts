import { TestBed, inject } from '@angular/core/testing';

import { TcpService } from './tcp.service';

describe('TcpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TcpService]
    });
  });

  it('should ...', inject([TcpService], (service: TcpService) => {
    expect(service).toBeTruthy();
  }));
});
