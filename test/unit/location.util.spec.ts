import 'mocha';
import { expect } from 'chai';
import { createAreaFilter, sectionCalculator } from '../../app/util/location.util';

describe('location.util.ts', () => {
  describe('location separation', function () {
    it('returns empty filter on empty queries', () => {
      expect(createAreaFilter([])).to.deep.eq({});
      expect(createAreaFilter([[32, 11], [23, 21]]));
    });

    it('puts all in one group & closes loop', () => {
      let posn = [[10, 0], [10, 10], [0, 10], [0, 0]];
      let ans = sectionCalculator(posn);

      expect(ans.length).to.be.eq(1);
      expect(ans[0].length).to.be.eq(5);
      expect(ans[0][0]).to.be.deep.eq(ans[0][ans[0].length - 1]);
    });

    it('splits on left side', () => {
      let posn = [[10, 0], [10, 10], [-190, 10], [-190, 0]];
      let ans = sectionCalculator(posn);

      expect(ans.length).to.be.eq(2);
      expect(ans[0][0]).to.be.deep.eq(ans[0][ans[0].length - 1]);
      expect(ans[0]).to.be.deep.eq( [[180, 10], [170, 10], [170, 0], [180, 0], [180, 10]] );
      expect(ans[1]).to.be.deep.eq([[10, 0], [10, 10], [-180, 10], [-180, 0], [10, 0]]);
    });

    it('splits on right side', () => {
      let posn = [[210, 0], [210, 10], [0, 10], [0, 0]];
      let ans = sectionCalculator(posn);
      expect(ans.length).to.be.eq(2);
      expect(ans[0][0]).to.be.deep.eq(ans[0][ans[0].length - 1]);
      expect(ans[0]).to.be.deep.eq( [[180, 0], [180, 10], [0, 10], [0, 0], [180, 0]]);
      expect(ans[1]).to.be.deep.eq( [[-180, 0], [-150, 0], [-150, 10], [-180, 10], [-180, 0]]);
    });
  });
});
