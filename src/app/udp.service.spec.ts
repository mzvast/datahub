import { TestBed, inject } from '@angular/core/testing';

import { UdpService } from './udp.service';

describe('UdpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UdpService]
    });
  });

  it('should ...', inject([UdpService], (service: UdpService) => {
    expect(service).toBeTruthy();
  }));
});
