## v0.8.0 (2023-09-19)

#### :boom: Breaking Change
* [#208](https://github.com/bustle/ember-mobiledoc-editor/pull/208) Update ember to 3.28 ([@lukemelia](https://github.com/lukemelia))

#### :rocket: Enhancement
* [#208](https://github.com/bustle/ember-mobiledoc-editor/pull/208) Update ember to 3.28 ([@lukemelia](https://github.com/lukemelia))

#### Committers: 1
- Luke Melia ([@lukemelia](https://github.com/lukemelia))

<a name="0.8.0"></a>
# 0.8.0 (2023-09-19)

* Add github actions CI ([0953619](https://github.com/bustle/ember-mobiledoc-editor/commit/0953619))
* Address lint errors ([9766b8a](https://github.com/bustle/ember-mobiledoc-editor/commit/9766b8a))
* Allow embroider-optimized build to fail for now ([97e205f](https://github.com/bustle/ember-mobiledoc-editor/commit/97e205f))
* Eliminate jquery usage ([101d39f](https://github.com/bustle/ember-mobiledoc-editor/commit/101d39f))
* Eliminate remaining deprecations ([6caef24](https://github.com/bustle/ember-mobiledoc-editor/commit/6caef24))
* Eliminate this-property-fallback deprecations ([bf8a22c](https://github.com/bustle/ember-mobiledoc-editor/commit/bf8a22c))
* Refactor away from reliance on getting the current Ember run loop ([ffefeb7](https://github.com/bustle/ember-mobiledoc-editor/commit/ffefeb7))
* Remove jquery dependency ([eee830d](https://github.com/bustle/ember-mobiledoc-editor/commit/eee830d))
* Remove unused file ([585b43e](https://github.com/bustle/ember-mobiledoc-editor/commit/585b43e))
* Replace usages of action helper ([7027350](https://github.com/bustle/ember-mobiledoc-editor/commit/7027350))
* WIP Upgrade to support ember 3.28 ([a716a52](https://github.com/bustle/ember-mobiledoc-editor/commit/a716a52))



<a name="0.7.0"></a>
# 0.7.0 (2022-10-24)

* Release 0.7.0 ([525aadb](https://github.com/bustle/ember-mobiledoc-editor/commit/525aadb))
* Update engine version to the one that allows yarn install to succeed ([0992db1](https://github.com/bustle/ember-mobiledoc-editor/commit/0992db1))
* refactor: refactor jQuery usages to element selectors ([95a2f7b](https://github.com/bustle/ember-mobiledoc-editor/commit/95a2f7b))



<a name="0.6.1"></a>
## 0.6.1 (2020-06-09)

* Move away from deprecated sendAction function ([42cfe9b](https://github.com/bustle/ember-mobiledoc-editor/commit/42cfe9b)), closes [#160](https://github.com/bustle/ember-mobiledoc-editor/issues/160)
* Release 0.6.1 ([17eb948](https://github.com/bustle/ember-mobiledoc-editor/commit/17eb948))



<a name="0.6.0"></a>
# 0.6.0 (2020-06-08)

* Add polyfill for hash-helper on ember-1.13 ([9051e53](https://github.com/bustle/ember-mobiledoc-editor/commit/9051e53))
* Adopt release-it for automating releases and changelog management ([9191f9b](https://github.com/bustle/ember-mobiledoc-editor/commit/9191f9b))
* Bump mixin-deep from 1.3.0 to 1.3.2 ([197ce58](https://github.com/bustle/ember-mobiledoc-editor/commit/197ce58))
* Bump websocket-extensions from 0.1.3 to 0.1.4 ([ae1e3c9](https://github.com/bustle/ember-mobiledoc-editor/commit/ae1e3c9))
* Pass showLinkTooltips option to editor ([de8c70a](https://github.com/bustle/ember-mobiledoc-editor/commit/de8c70a))
* Refactor inputModeDidChange to improve readability ([118b1d1](https://github.com/bustle/ember-mobiledoc-editor/commit/118b1d1))
* Release 0.6.0 ([96b2925](https://github.com/bustle/ember-mobiledoc-editor/commit/96b2925))
* Remove custom hash helper to use ember-source fallback ([0d020cf](https://github.com/bustle/ember-mobiledoc-editor/commit/0d020cf))
* Remove unused helper re-export ([59b5edb](https://github.com/bustle/ember-mobiledoc-editor/commit/59b5edb))
* Test with a supported version of node ([93653e2](https://github.com/bustle/ember-mobiledoc-editor/commit/93653e2))
* update mobiledoc kit ([a1d6554](https://github.com/bustle/ember-mobiledoc-editor/commit/a1d6554))
* Update mobiledoc-dom-renderer and mobiledoc-kit ([345d4d4](https://github.com/bustle/ember-mobiledoc-editor/commit/345d4d4))
* Update repository to format expected by release-it ([774b9dc](https://github.com/bustle/ember-mobiledoc-editor/commit/774b9dc))
* Update to support mobiledoc 0.3.2 ([f256fc9](https://github.com/bustle/ember-mobiledoc-editor/commit/f256fc9))
* chore(css): add a class to the div wrapping a card ([cf71a12](https://github.com/bustle/ember-mobiledoc-editor/commit/cf71a12))



<a name="0.5.15"></a>
## 0.5.15 (2018-06-29)

* v0.5.15 ([95e1807](https://github.com/bustle/ember-mobiledoc-editor/commit/95e1807))
* doc(lifecycle hooks): Document lifecycle hooks (#155) ([bb87a00](https://github.com/bustle/ember-mobiledoc-editor/commit/bb87a00)), closes [#155](https://github.com/bustle/ember-mobiledoc-editor/issues/155)
* feat(cursorDidChange): Add cursorDidChange callback to editor compo (#148) ([39c573c](https://github.com/bustle/ember-mobiledoc-editor/commit/39c573c)), closes [#148](https://github.com/bustle/ember-mobiledoc-editor/issues/148)



<a name="0.5.14"></a>
## 0.5.14 (2018-06-25)

* Fallback to parent coords in `tether-to-selection` (#141) ([1bfd8ca](https://github.com/bustle/ember-mobiledoc-editor/commit/1bfd8ca)), closes [#141](https://github.com/bustle/ember-mobiledoc-editor/issues/141)
* Upgrade mobiledoc-kit to 0.11.1 ([cb3aa09](https://github.com/bustle/ember-mobiledoc-editor/commit/cb3aa09))
* v0.5.14 ([861bc06](https://github.com/bustle/ember-mobiledoc-editor/commit/861bc06))
* chore(ci): Temporary fix for Travis service issue (travis-ci#8836) ([b7bebe3](https://github.com/bustle/ember-mobiledoc-editor/commit/b7bebe3)), closes [travis-ci#8836](https://github.com/travis-ci/issues/8836) [travis-ci/travis-ci#8836](https://github.com/travis-ci/travis-ci/issues/8836)
* chore(dependencies): Bump deps, with associated changes for Ember ecosystem ([3d15c82](https://github.com/bustle/ember-mobiledoc-editor/commit/3d15c82))
* chore(fix tests): Throw editor render errors after runloop (#152) ([2fdfdad](https://github.com/bustle/ember-mobiledoc-editor/commit/2fdfdad)), closes [#152](https://github.com/bustle/ember-mobiledoc-editor/issues/152)



<a name="0.5.13"></a>
## 0.5.13 (2017-09-25)

* v0.5.13 ([6036bd0](https://github.com/bustle/ember-mobiledoc-editor/commit/6036bd0))



<a name="0.5.13-alpha"></a>
## 0.5.13-alpha (2017-09-25)

* Include mobiledoc-dom-renderer source map ([7f845de](https://github.com/bustle/ember-mobiledoc-editor/commit/7f845de))
* v0.5.13-alpha ([d00adb2](https://github.com/bustle/ember-mobiledoc-editor/commit/d00adb2))



<a name="0.5.12"></a>
## 0.5.12 (2017-08-14)

* Upgrade mobiledoc-kit dep, use editor#toggleMarkup (#139) ([66d0e65](https://github.com/bustle/ember-mobiledoc-editor/commit/66d0e65)), closes [#139](https://github.com/bustle/ember-mobiledoc-editor/issues/139)
* v0.5.12 ([8f6c907](https://github.com/bustle/ember-mobiledoc-editor/commit/8f6c907))



<a name="0.5.11"></a>
## 0.5.11 (2017-08-08)

* Start documenting atoms for the editor ([8c6e979](https://github.com/bustle/ember-mobiledoc-editor/commit/8c6e979))
* v0.5.11 ([d4b3534](https://github.com/bustle/ember-mobiledoc-editor/commit/d4b3534))
* chore(dependencies): Add yarn.lock, specify yarn in README (#135) ([8edf7f8](https://github.com/bustle/ember-mobiledoc-editor/commit/8edf7f8)), closes [#135](https://github.com/bustle/ember-mobiledoc-editor/issues/135)
* chore(dependencies): Upgrade outdated packages (#138) ([0846c8e](https://github.com/bustle/ember-mobiledoc-editor/commit/0846c8e)), closes [#138](https://github.com/bustle/ember-mobiledoc-editor/issues/138)
* chore(docs): Add npm version and ember observer badges (#137) ([3a3804f](https://github.com/bustle/ember-mobiledoc-editor/commit/3a3804f)), closes [#137](https://github.com/bustle/ember-mobiledoc-editor/issues/137)
* chore(docs): change bustlelabs urls to bustle (#136) ([1006ced](https://github.com/bustle/ember-mobiledoc-editor/commit/1006ced)), closes [#136](https://github.com/bustle/ember-mobiledoc-editor/issues/136)
* fix(link prompt submit): Move link prompt submit action to submit button (#132) ([a31f0ef](https://github.com/bustle/ember-mobiledoc-editor/commit/a31f0ef)), closes [#132](https://github.com/bustle/ember-mobiledoc-editor/issues/132)



<a name="0.5.10"></a>
## 0.5.10 (2017-03-14)

* 0.5.10 ([f540182](https://github.com/bustle/ember-mobiledoc-editor/commit/f540182))
* remove ember-cli-release (#131) ([4bf0c4a](https://github.com/bustle/ember-mobiledoc-editor/commit/4bf0c4a)), closes [#131](https://github.com/bustle/ember-mobiledoc-editor/issues/131)
* Upgrade dependencies (#130) ([e36db79](https://github.com/bustle/ember-mobiledoc-editor/commit/e36db79)), closes [#130](https://github.com/bustle/ember-mobiledoc-editor/issues/130)
* Use TestAdapter to ensure render errors are thrown (#129) ([b830f52](https://github.com/bustle/ember-mobiledoc-editor/commit/b830f52)), closes [#129](https://github.com/bustle/ember-mobiledoc-editor/issues/129) [#128](https://github.com/bustle/ember-mobiledoc-editor/issues/128)



<a name="0.5.9"></a>
## 0.5.9 (2017-02-22)

* 0.5.9 ([0c7bb50](https://github.com/bustle/ember-mobiledoc-editor/commit/0c7bb50))
* Make mobiledoc-dom-renderer a dependency (#127) ([a4dfb67](https://github.com/bustle/ember-mobiledoc-editor/commit/a4dfb67)), closes [#127](https://github.com/bustle/ember-mobiledoc-editor/issues/127)



<a name="0.5.8"></a>
## 0.5.8 (2017-02-11)

* 0.5.8 ([2c43fa5](https://github.com/bustle/ember-mobiledoc-editor/commit/2c43fa5))
* Add 1.13 to the travis build ([2a6ab67](https://github.com/bustle/ember-mobiledoc-editor/commit/2a6ab67))
* Bump mobiledoc-kit to release version ([10114d9](https://github.com/bustle/ember-mobiledoc-editor/commit/10114d9))



<a name="0.5.8-1"></a>
## 0.5.8-1 (2017-02-09)

* 0.5.8-1 ([b9ef0c5](https://github.com/bustle/ember-mobiledoc-editor/commit/b9ef0c5))
* Bump to ember-cli 2.12.0-beta.1 ([53f072e](https://github.com/bustle/ember-mobiledoc-editor/commit/53f072e))
* cardHooks take priority over user card options ([d35a903](https://github.com/bustle/ember-mobiledoc-editor/commit/d35a903))
* Pass card options to card/atom components ([b451a22](https://github.com/bustle/ember-mobiledoc-editor/commit/b451a22))
* Update editor class in acceptance test example ([55616bc](https://github.com/bustle/ember-mobiledoc-editor/commit/55616bc))



<a name="0.5.8-0"></a>
## 0.5.8-0 (2016-11-17)

* 0.5.8-0 ([050a8c9](https://github.com/bustle/ember-mobiledoc-editor/commit/050a8c9))
* Bump deps to mobiledoc-kit beta ([2a4eead](https://github.com/bustle/ember-mobiledoc-editor/commit/2a4eead))
* Schedule active setup into runloop afterRender ([9813a23](https://github.com/bustle/ember-mobiledoc-editor/commit/9813a23))



<a name="0.5.7"></a>
## 0.5.7 (2016-11-04)

* 0.5.7 ([eada514](https://github.com/bustle/ember-mobiledoc-editor/commit/eada514))
* feat(atom.save): Pass atom.save to atom components (#117) ([142ef3d](https://github.com/bustle/ember-mobiledoc-editor/commit/142ef3d)), closes [#117](https://github.com/bustle/ember-mobiledoc-editor/issues/117)



<a name="0.5.6"></a>
## 0.5.6 (2016-09-13)

* 0.5.6 ([a5b2d54](https://github.com/bustle/ember-mobiledoc-editor/commit/a5b2d54))
* tests(beta): remove beta from allowed failures (#111) ([675701f](https://github.com/bustle/ember-mobiledoc-editor/commit/675701f)), closes [#111](https://github.com/bustle/ember-mobiledoc-editor/issues/111)
* chore(npm): upgrade to mobiledoc-kit ^0.10.10 (#109) ([5394ee7](https://github.com/bustle/ember-mobiledoc-editor/commit/5394ee7)), closes [#109](https://github.com/bustle/ember-mobiledoc-editor/issues/109)
* feat(test-helpers): Add `insertText` and `run` ember-mobiledoc-kit editor helpers (#107) ([84f311e](https://github.com/bustle/ember-mobiledoc-editor/commit/84f311e)), closes [#107](https://github.com/bustle/ember-mobiledoc-editor/issues/107) [#100](https://github.com/bustle/ember-mobiledoc-editor/issues/100)
* test(atoms): test that atoms do not rerender when section changes (#105) ([2a3e9a0](https://github.com/bustle/ember-mobiledoc-editor/commit/2a3e9a0)), closes [#105](https://github.com/bustle/ember-mobiledoc-editor/issues/105) [#90](https://github.com/bustle/ember-mobiledoc-editor/issues/90)
* test(beta): Fix beta tests, update to wormhole ^0.4.1 (#108) ([d24182b](https://github.com/bustle/ember-mobiledoc-editor/commit/d24182b)), closes [#108](https://github.com/bustle/ember-mobiledoc-editor/issues/108) [#99](https://github.com/bustle/ember-mobiledoc-editor/issues/99)



<a name="0.5.5"></a>
## 0.5.5 (2016-08-31)

* 0.5.5 ([201f04b](https://github.com/bustle/ember-mobiledoc-editor/commit/201f04b))
* chore(dependencies): bump mobiledoc-kit to ^0.10.9 (#103) ([5c4dce6](https://github.com/bustle/ember-mobiledoc-editor/commit/5c4dce6)), closes [#103](https://github.com/bustle/ember-mobiledoc-editor/issues/103)
* test(add-card): Test that adding a card to a blank post is allowed (#104) ([7cf04f7](https://github.com/bustle/ember-mobiledoc-editor/commit/7cf04f7)), closes [#104](https://github.com/bustle/ember-mobiledoc-editor/issues/104) [#86](https://github.com/bustle/ember-mobiledoc-editor/issues/86)
* docs(changelog): update changelog ([52b3d52](https://github.com/bustle/ember-mobiledoc-editor/commit/52b3d52))



<a name="0.5.4"></a>
## 0.5.4 (2016-08-10)

* 0.5.4 ([7846c63](https://github.com/bustle/ember-mobiledoc-editor/commit/7846c63))
* feat(buttons): Add property for title attribute on button components (#102) ([3205b96](https://github.com/bustle/ember-mobiledoc-editor/commit/3205b96)), closes [#102](https://github.com/bustle/ember-mobiledoc-editor/issues/102)
* chore(npm): Use "version" script instead of "postversion" (#101) ([9aaeeab](https://github.com/bustle/ember-mobiledoc-editor/commit/9aaeeab)), closes [#101](https://github.com/bustle/ember-mobiledoc-editor/issues/101)



<a name="0.5.3"></a>
## 0.5.3 (2016-07-27)

* 0.5.3 ([890edac](https://github.com/bustle/ember-mobiledoc-editor/commit/890edac))
* Update to ember-cli 2.5.0 ([b793e9d](https://github.com/bustle/ember-mobiledoc-editor/commit/b793e9d))



<a name="0.5.2"></a>
## 0.5.2 (2016-07-27)

* 0.5.2 ([36384d0](https://github.com/bustle/ember-mobiledoc-editor/commit/36384d0))
* allow ember-beta to fail ([df15cd8](https://github.com/bustle/ember-mobiledoc-editor/commit/df15cd8))
* remove deprecated `createListSection` (#95) ([ca8f997](https://github.com/bustle/ember-mobiledoc-editor/commit/ca8f997)), closes [#95](https://github.com/bustle/ember-mobiledoc-editor/issues/95)
* Update mobiledoc-kit to ^0.10.3, mobiledoc-dom-renderer to ^0.5.3 (#96) ([6fe8884](https://github.com/bustle/ember-mobiledoc-editor/commit/6fe8884)), closes [#96](https://github.com/bustle/ember-mobiledoc-editor/issues/96)
* Update release instructions ([3380c85](https://github.com/bustle/ember-mobiledoc-editor/commit/3380c85))
* update to ember-cli 1.13.15 ([736755b](https://github.com/bustle/ember-mobiledoc-editor/commit/736755b))
* upgrade to ember-cli 1.13.12 (#81) ([20816f0](https://github.com/bustle/ember-mobiledoc-editor/commit/20816f0)), closes [#81](https://github.com/bustle/ember-mobiledoc-editor/issues/81)



<a name="0.5.1"></a>
## 0.5.1 (2016-07-19)

* 0.5.1 ([b642347](https://github.com/bustle/ember-mobiledoc-editor/commit/b642347))
* Update ember-wormhole (#93) ([02451ee](https://github.com/bustle/ember-mobiledoc-editor/commit/02451ee)), closes [#93](https://github.com/bustle/ember-mobiledoc-editor/issues/93)
* update release instructions ([9e06a5f](https://github.com/bustle/ember-mobiledoc-editor/commit/9e06a5f))
* Update travis.yml to use npm@3, node@6.2.0, and prebuilt phantom (#94) ([e6d5ebe](https://github.com/bustle/ember-mobiledoc-editor/commit/e6d5ebe)), closes [#94](https://github.com/bustle/ember-mobiledoc-editor/issues/94)



<a name="0.5.0"></a>
# 0.5.0 (2016-07-18)

* (tests) Change activeSectionTagNames test to be more robust ([7f07d44](https://github.com/bustle/ember-mobiledoc-editor/commit/7f07d44))
* (tests) Use `cursorDidChange` callback in `activeSectionTagNames` tests ([e38d621](https://github.com/bustle/ember-mobiledoc-editor/commit/e38d621))
* 0.5.0 ([33ceb82](https://github.com/bustle/ember-mobiledoc-editor/commit/33ceb82))
* add postversion script for `np` ([ee69deb](https://github.com/bustle/ember-mobiledoc-editor/commit/ee69deb))
* added to <button>s elements `type="button"` to avoid a11y problems ([d45d77f](https://github.com/bustle/ember-mobiledoc-editor/commit/d45d77f))
* Update to mobiledoc-kit 0.10.1 ([22c7805](https://github.com/bustle/ember-mobiledoc-editor/commit/22c7805))



<a name="0.4.3"></a>
## 0.4.3 (2016-06-03)

* [docs] Add `addAtom` hook to readme ([1cfc925](https://github.com/bustle/ember-mobiledoc-editor/commit/1cfc925))
* added ability for document object to be passed in ([4e44203](https://github.com/bustle/ember-mobiledoc-editor/commit/4e44203))
* made the fallback more friendly for simple DOM ([6df69ad](https://github.com/bustle/ember-mobiledoc-editor/commit/6df69ad))
* v0.4.3 ([3fff054](https://github.com/bustle/ember-mobiledoc-editor/commit/3fff054))



<a name="0.4.2"></a>
## 0.4.2 (2016-05-10)

* Adds createComponentAtom util to use Ember.Component as atoms ([f553a4d](https://github.com/bustle/ember-mobiledoc-editor/commit/f553a4d))
* bump mobiledoc-kit to ^0.9.4 ([e57f8f9](https://github.com/bustle/ember-mobiledoc-editor/commit/e57f8f9))
* Change deprecated Ember.merge to Ember.assign ([af8ee4d](https://github.com/bustle/ember-mobiledoc-editor/commit/af8ee4d))
* depend on fix in mobiledoc-kit 0.9.4-beta.1 ([1f5aae0](https://github.com/bustle/ember-mobiledoc-editor/commit/1f5aae0))
* Expose `addAtom` action. Refactor tests for greater clarity ([edbb8fe](https://github.com/bustle/ember-mobiledoc-editor/commit/edbb8fe))
* Update mobiledoc-kit to ^0.9.6 ([7595f9a](https://github.com/bustle/ember-mobiledoc-editor/commit/7595f9a))
* Use editor#insertAtom and editor#insertCard ([cf96819](https://github.com/bustle/ember-mobiledoc-editor/commit/cf96819))
* v0.4.2 ([1c8a9dc](https://github.com/bustle/ember-mobiledoc-editor/commit/1c8a9dc))



<a name="0.4.1"></a>
## 0.4.1 (2016-04-14)

* [BUGFIX] Ensure ol/ul buttons have correct active state ([1f2d69a](https://github.com/bustle/ember-mobiledoc-editor/commit/1f2d69a)), closes [#22](https://github.com/bustle/ember-mobiledoc-editor/issues/22)
* [CLEANUP] Remove deprecated `toggleSectionTagName` ([3ac0ede](https://github.com/bustle/ember-mobiledoc-editor/commit/3ac0ede))
* Deprecate createListSection. Use toggleSection instead. ([d249856](https://github.com/bustle/ember-mobiledoc-editor/commit/d249856))
* Ensure `toggleLink` does nothing when no selection ([5976c2b](https://github.com/bustle/ember-mobiledoc-editor/commit/5976c2b)), closes [#70](https://github.com/bustle/ember-mobiledoc-editor/issues/70)
* Make tether-to-selection use fixed positioning relative to selection ([3fa3fe1](https://github.com/bustle/ember-mobiledoc-editor/commit/3fa3fe1))
* update conventional changelog deps ([cd6855b](https://github.com/bustle/ember-mobiledoc-editor/commit/cd6855b))
* update mobiledoc-dom-renderer to ^0.5.0 ([a80160c](https://github.com/bustle/ember-mobiledoc-editor/commit/a80160c))
* Update mobiledoc-kit dependency to ^0.9.2 ([78df990](https://github.com/bustle/ember-mobiledoc-editor/commit/78df990))
* Update README.md ([0939f8a](https://github.com/bustle/ember-mobiledoc-editor/commit/0939f8a))
* Use inputModeDidChange and postDidChange hooks ([02cda9a](https://github.com/bustle/ember-mobiledoc-editor/commit/02cda9a))
* v0.4.1 ([25199d1](https://github.com/bustle/ember-mobiledoc-editor/commit/25199d1))



<a name="0.4.0"></a>
# 0.4.0 (2016-03-22)

* Expose card env to ember component cards ([44a6cd8](https://github.com/bustle/ember-mobiledoc-editor/commit/44a6cd8))
* Test that component cards are passed env and other properties ([a2dff20](https://github.com/bustle/ember-mobiledoc-editor/commit/a2dff20)), closes [#64](https://github.com/bustle/ember-mobiledoc-editor/issues/64)
* update mobiledoc-kit dep to ^0.9.0 ([2c2c0f2](https://github.com/bustle/ember-mobiledoc-editor/commit/2c2c0f2))
* v0.4.0 ([270cc33](https://github.com/bustle/ember-mobiledoc-editor/commit/270cc33))



<a name="0.4.0-beta.1"></a>
# 0.4.0-beta.1 (2016-03-17)

* upgrade mobiledoc-kit to 0.9.0-beta.1 ([cb6d0b9](https://github.com/bustle/ember-mobiledoc-editor/commit/cb6d0b9))
* v0.4.0-beta.1 ([b8fcb1a](https://github.com/bustle/ember-mobiledoc-editor/commit/b8fcb1a))



<a name="0.3.8"></a>
## 0.3.8 (2016-03-17)

* Document and test on-change, will-create-editor, did-create-editor hooks ([08fc08e](https://github.com/bustle/ember-mobiledoc-editor/commit/08fc08e))
* Extensibility hooks ([8c67d33](https://github.com/bustle/ember-mobiledoc-editor/commit/8c67d33)), closes [#24](https://github.com/bustle/ember-mobiledoc-editor/issues/24)
* Fix SyntaxError ([ca7f020](https://github.com/bustle/ember-mobiledoc-editor/commit/ca7f020))
* v0.3.8 ([9236303](https://github.com/bustle/ember-mobiledoc-editor/commit/9236303))



<a name="0.3.7"></a>
## 0.3.7 (2016-03-06)

* 0.3.7 ([0086ed7](https://github.com/bustle/ember-mobiledoc-editor/commit/0086ed7))
* upgrade broccoli-funnel to ^1.0.1 ([c2c59ea](https://github.com/bustle/ember-mobiledoc-editor/commit/c2c59ea)), closes [#55](https://github.com/bustle/ember-mobiledoc-editor/issues/55)



<a name="0.3.6"></a>
## 0.3.6 (2016-03-05)

* Pass `payload` to card components, replaces `data` ([be336c1](https://github.com/bustle/ember-mobiledoc-editor/commit/be336c1))
* update release instructions ([f0397d2](https://github.com/bustle/ember-mobiledoc-editor/commit/f0397d2))
* v0.3.6 ([9edf43d](https://github.com/bustle/ember-mobiledoc-editor/commit/9edf43d))



<a name="0.3.5"></a>
## 0.3.5 (2016-02-11)

* Expose version ([56b2899](https://github.com/bustle/ember-mobiledoc-editor/commit/56b2899))
* v0.3.5 ([20340e2](https://github.com/bustle/ember-mobiledoc-editor/commit/20340e2))



<a name="0.3.4"></a>
## 0.3.4 (2016-02-10)

* 0.3.4 ([c190934](https://github.com/bustle/ember-mobiledoc-editor/commit/c190934))
* bump mobiledoc-kit to 0.8.3 ([a53d3ad](https://github.com/bustle/ember-mobiledoc-editor/commit/a53d3ad))



<a name="0.3.3"></a>
## 0.3.3 (2016-02-08)

* 0.3.3 ([3927578](https://github.com/bustle/ember-mobiledoc-editor/commit/3927578))
* Exposes `serializeVersion` property on `{{mobiledoc-editor}}` ([3ad2695](https://github.com/bustle/ember-mobiledoc-editor/commit/3ad2695))
* Update changelog ([98e749b](https://github.com/bustle/ember-mobiledoc-editor/commit/98e749b))



<a name="0.3.2"></a>
## 0.3.2 (2016-02-04)

* 0.3.2 ([7f91b3e](https://github.com/bustle/ember-mobiledoc-editor/commit/7f91b3e))
* update mobiledoc-editor, mobiledoc-dom-renderer deps ([2173441](https://github.com/bustle/ember-mobiledoc-editor/commit/2173441))



<a name="0.3.0-beta.6"></a>
# 0.3.0-beta.6 (2016-02-02)

* Use mobiledoc-kit's AMD build ([5ee6171](https://github.com/bustle/ember-mobiledoc-editor/commit/5ee6171))
* v0.3.0-beta.6 ([2ef71aa](https://github.com/bustle/ember-mobiledoc-editor/commit/2ef71aa))



<a name="0.3.2-beta.5"></a>
## 0.3.2-beta.5 (2016-01-25)

* 0.3.2-beta.5 ([f057002](https://github.com/bustle/ember-mobiledoc-editor/commit/f057002))
* Catch exception when dom renderer not present ([ca973a9](https://github.com/bustle/ember-mobiledoc-editor/commit/ca973a9))



<a name="0.3.2-beta.4"></a>
## 0.3.2-beta.4 (2016-01-25)

* 0.3.2-beta.4 ([d3ad64b](https://github.com/bustle/ember-mobiledoc-editor/commit/d3ad64b))



<a name="0.3.2-beta2"></a>
## 0.3.2-beta2 (2016-01-25)

* 0.3.2-beta2 ([bb3ce25](https://github.com/bustle/ember-mobiledoc-editor/commit/bb3ce25))
* component cards have fallback rendering ([f54c086](https://github.com/bustle/ember-mobiledoc-editor/commit/f54c086))
* Wrap ember code in runloops correctly ([282d8b3](https://github.com/bustle/ember-mobiledoc-editor/commit/282d8b3))



<a name="0.3.2-beta.1"></a>
## 0.3.2-beta.1 (2016-01-11)

*  use beta 3 of mobiledoc-kit ([43085a8](https://github.com/bustle/ember-mobiledoc-editor/commit/43085a8))
* Change test to ensure editor reference is maintained ([640a8fa](https://github.com/bustle/ember-mobiledoc-editor/commit/640a8fa))
* ensure addCard action sets range ([87896bb](https://github.com/bustle/ember-mobiledoc-editor/commit/87896bb))
* Minimize rerender from new Mobiledoc ([e80a320](https://github.com/bustle/ember-mobiledoc-editor/commit/e80a320)), closes [#42](https://github.com/bustle/ember-mobiledoc-editor/issues/42)
* Update changelog ([5c8733c](https://github.com/bustle/ember-mobiledoc-editor/commit/5c8733c))
* v0.3.2-beta.1 ([ba833a5](https://github.com/bustle/ember-mobiledoc-editor/commit/ba833a5))



<a name="0.3.1"></a>
## 0.3.1 (2015-12-17)

* Add before_install to travis.yml to install phantom 2 ([a9edd14](https://github.com/bustle/ember-mobiledoc-editor/commit/a9edd14))
* add changelog ([4cc051d](https://github.com/bustle/ember-mobiledoc-editor/commit/4cc051d))
* add test for changing editor content ([2e235df](https://github.com/bustle/ember-mobiledoc-editor/commit/2e235df))
* Expose `toggleSection` action, deprecate `toggleSectionTagName` ([20391e7](https://github.com/bustle/ember-mobiledoc-editor/commit/20391e7))
* Pass atoms through to the editor ([feddc0c](https://github.com/bustle/ember-mobiledoc-editor/commit/feddc0c))
* Released v0.3.1 ([d73a7af](https://github.com/bustle/ember-mobiledoc-editor/commit/d73a7af))
* Update changelog ([a16d21a](https://github.com/bustle/ember-mobiledoc-editor/commit/a16d21a))
* update mobiledoc-kit dep to ^0.7.3 ([abe4cb7](https://github.com/bustle/ember-mobiledoc-editor/commit/abe4cb7))



<a name="0.3.0"></a>
# 0.3.0 (2015-11-24)

* bump to mobiledoc-kit 0.7.0 ([efe78b5](https://github.com/bustle/ember-mobiledoc-editor/commit/efe78b5))
* Released v0.3.0 ([296eef0](https://github.com/bustle/ember-mobiledoc-editor/commit/296eef0))



<a name="0.2.2-beta2"></a>
## 0.2.2-beta2 (2015-11-23)

* Test that `postModel` is exposed to component cards ([de64fd9](https://github.com/bustle/ember-mobiledoc-editor/commit/de64fd9))
* v0.2.2-beta2 ([3f0ac4f](https://github.com/bustle/ember-mobiledoc-editor/commit/3f0ac4f))



<a name="0.2.2-beta1"></a>
## 0.2.2-beta1 (2015-11-23)

* Refactor card rendering to use new card shapes ([2e7a9bd](https://github.com/bustle/ember-mobiledoc-editor/commit/2e7a9bd)), closes [#33](https://github.com/bustle/ember-mobiledoc-editor/issues/33)
* Test that unknownCardHandler is used ([4aec879](https://github.com/bustle/ember-mobiledoc-editor/commit/4aec879))
* Update dependencies ([20bade2](https://github.com/bustle/ember-mobiledoc-editor/commit/20bade2))
* Use 0.6.2 beta of mobiledoc-kit ([1f5cfe3](https://github.com/bustle/ember-mobiledoc-editor/commit/1f5cfe3))
* v0.2.2-beta1 ([d3fc788](https://github.com/bustle/ember-mobiledoc-editor/commit/d3fc788))



<a name="0.2.1"></a>
## 0.2.1 (2015-11-18)

* Float mobiledoc-kit dep ([e8f9aa2](https://github.com/bustle/ember-mobiledoc-editor/commit/e8f9aa2))
* Released v0.2.1 ([4aa0bff](https://github.com/bustle/ember-mobiledoc-editor/commit/4aa0bff))



<a name="0.2.0"></a>
# 0.2.0 (2015-11-16)

* 0.2.0 ([30fac3e](https://github.com/bustle/ember-mobiledoc-editor/commit/30fac3e))



<a name="0.2.0-beta1"></a>
# 0.2.0-beta1 (2015-11-10)

* 0.2.0-beta1 ([7ab7b44](https://github.com/bustle/ember-mobiledoc-editor/commit/7ab7b44))
* Rename ember-content-kit to ember-mobiledoc-editor ([dd9935a](https://github.com/bustle/ember-mobiledoc-editor/commit/dd9935a))



<a name="0.1.15"></a>
## 0.1.15 (2015-11-09)

* Bump Content-Kit ([12f6b59](https://github.com/bustle/ember-mobiledoc-editor/commit/12f6b59))
* Released v0.1.15 ([1395b11](https://github.com/bustle/ember-mobiledoc-editor/commit/1395b11))



<a name="0.1.14"></a>
## 0.1.14 (2015-11-02)

* Content-Kit 0.5.0 ([75e7e19](https://github.com/bustle/ember-mobiledoc-editor/commit/75e7e19))
* Patch to work with NPM 3 ([64a9c0e](https://github.com/bustle/ember-mobiledoc-editor/commit/64a9c0e))
* Released v0.1.14 ([2e01960](https://github.com/bustle/ember-mobiledoc-editor/commit/2e01960))



<a name="0.1.13"></a>
## 0.1.13 (2015-10-27)

* 0.1.13 ([7bf3d5c](https://github.com/bustle/ember-mobiledoc-editor/commit/7bf3d5c))
* bump content-kit-editor to ^0.5.0-beta.1 ([67a2200](https://github.com/bustle/ember-mobiledoc-editor/commit/67a2200))



<a name="0.1.12"></a>
## 0.1.12 (2015-10-27)

* 0.1.12 ([ddbfc5d](https://github.com/bustle/ember-mobiledoc-editor/commit/ddbfc5d))
* Add "options" property to `{{content-kit-editor}}` ([8aa91f4](https://github.com/bustle/ember-mobiledoc-editor/commit/8aa91f4))
* Include previous versions in changelog ([ea9c44e](https://github.com/bustle/ember-mobiledoc-editor/commit/ea9c44e))



<a name="0.1.11"></a>
## 0.1.11 (2015-10-25)

* 0.1.11 ([8ff0c23](https://github.com/bustle/ember-mobiledoc-editor/commit/8ff0c23))
* export components correctly ([8ef5047](https://github.com/bustle/ember-mobiledoc-editor/commit/8ef5047))
* Fix mislabeled button in toolbar ([0e5d17a](https://github.com/bustle/ember-mobiledoc-editor/commit/0e5d17a))



<a name="0.1.10"></a>
## 0.1.10 (2015-10-23)

* 0.1.10 ([990435f](https://github.com/bustle/ember-mobiledoc-editor/commit/990435f))
* bump content-kit-editor to 0.4.11 ([fa66919](https://github.com/bustle/ember-mobiledoc-editor/commit/fa66919))



<a name="0.1.9"></a>
## 0.1.9 (2015-10-22)

* 0.1.9 ([7b15040](https://github.com/bustle/ember-mobiledoc-editor/commit/7b15040))
* update content-kit-editor to 0.4.10 ([33bd8d9](https://github.com/bustle/ember-mobiledoc-editor/commit/33bd8d9))



<a name="0.1.8"></a>
## 0.1.8 (2015-10-20)

* 0.1.8 ([c091b81](https://github.com/bustle/ember-mobiledoc-editor/commit/c091b81))
* Insert card after the current section not before ([e16a3b7](https://github.com/bustle/ember-mobiledoc-editor/commit/e16a3b7))



<a name="0.1.7"></a>
## 0.1.7 (2015-10-20)

* Released v0.1.7 ([9aa400c](https://github.com/bustle/ember-mobiledoc-editor/commit/9aa400c))
* Remove active blank section when adding card ([32c682a](https://github.com/bustle/ember-mobiledoc-editor/commit/32c682a))



<a name="0.1.6"></a>
## 0.1.6 (2015-10-20)

* 0.1.6 ([188ac0e](https://github.com/bustle/ember-mobiledoc-editor/commit/188ac0e))
* bump to content-kit-editor 0.4.9 ([4b332d6](https://github.com/bustle/ember-mobiledoc-editor/commit/4b332d6))
* Update docs about cards ([7afe10c](https://github.com/bustle/ember-mobiledoc-editor/commit/7afe10c))



<a name="0.1.5"></a>
## 0.1.5 (2015-10-16)

* add/remove components within runloop ([29c1842](https://github.com/bustle/ember-mobiledoc-editor/commit/29c1842))
* Bump to 0.4.8 ([526aa8b](https://github.com/bustle/ember-mobiledoc-editor/commit/526aa8b))
* Include content-kit-editor.map ([12d636b](https://github.com/bustle/ember-mobiledoc-editor/commit/12d636b)), closes [#19](https://github.com/bustle/ember-mobiledoc-editor/issues/19)
* Released v0.1.5 ([97c2bba](https://github.com/bustle/ember-mobiledoc-editor/commit/97c2bba))



<a name="0.1.4"></a>
## 0.1.4 (2015-10-15)

* 0.1.4 ([a3bda67](https://github.com/bustle/ember-mobiledoc-editor/commit/a3bda67))
* bump content-kit-editor version ([5c126cd](https://github.com/bustle/ember-mobiledoc-editor/commit/5c126cd))
* Check if the item has property in cursorDidChange -> arrayToMap ([e26d54d](https://github.com/bustle/ember-mobiledoc-editor/commit/e26d54d))
* pass placeholder, autofocus and spellcheck through to the editor ([f19ef19](https://github.com/bustle/ember-mobiledoc-editor/commit/f19ef19))
* yield `addCardInEditMode` action from {{content-kit-editor}} ([8366129](https://github.com/bustle/ember-mobiledoc-editor/commit/8366129)), closes [#15](https://github.com/bustle/ember-mobiledoc-editor/issues/15)



<a name="0.1.3"></a>
## 0.1.3 (2015-10-07)

* 0.1.3 ([5f4d6c7](https://github.com/bustle/ember-mobiledoc-editor/commit/5f4d6c7))
* Add test for component card ([dad4bac](https://github.com/bustle/ember-mobiledoc-editor/commit/dad4bac))
* Drop unused attr for component cards ([b17c569](https://github.com/bustle/ember-mobiledoc-editor/commit/b17c569))
* First draft of component docs ([cdb631a](https://github.com/bustle/ember-mobiledoc-editor/commit/cdb631a))
* Initial button implementation ([9eb0264](https://github.com/bustle/ember-mobiledoc-editor/commit/9eb0264)), closes [#6](https://github.com/bustle/ember-mobiledoc-editor/issues/6)
* Update package.json ([f174093](https://github.com/bustle/ember-mobiledoc-editor/commit/f174093))



<a name="0.1.2"></a>
## 0.1.2 (2015-10-05)

* 0.1.2 ([bf3e516](https://github.com/bustle/ember-mobiledoc-editor/commit/bf3e516))
* Map markup and section state ([5ac005a](https://github.com/bustle/ember-mobiledoc-editor/commit/5ac005a))



<a name="0.1.1"></a>
## 0.1.1 (2015-10-01)

* 0.1.1 ([8668d47](https://github.com/bustle/ember-mobiledoc-editor/commit/8668d47))
* Bump to support 0.4.6 ([8b9a18a](https://github.com/bustle/ember-mobiledoc-editor/commit/8b9a18a))



<a name="0.1.0"></a>
# 0.1.0 (2015-09-30)

* 0.1.0 ([15970e2](https://github.com/bustle/ember-mobiledoc-editor/commit/15970e2))
* Drop front requirement for toobar ([fa03b2c](https://github.com/bustle/ember-mobiledoc-editor/commit/fa03b2c))
* Teardown old editors ([da26f30](https://github.com/bustle/ember-mobiledoc-editor/commit/da26f30))



<a name="0.0.2"></a>
## 0.0.2 (2015-09-24)

* 0.0.2 ([1449bf3](https://github.com/bustle/ember-mobiledoc-editor/commit/1449bf3))
* Bump Content-Kit to 0.4.5 ([9567cc5](https://github.com/bustle/ember-mobiledoc-editor/commit/9567cc5))



<a name="0.0.1"></a>
## 0.0.1 (2015-09-24)

* 0.0.1 ([7f2e40f](https://github.com/bustle/ember-mobiledoc-editor/commit/7f2e40f))
* Initial Commit from Ember CLI v1.13.8 ([6cc2331](https://github.com/bustle/ember-mobiledoc-editor/commit/6cc2331))
* Initial implementation ([cd789cb](https://github.com/bustle/ember-mobiledoc-editor/commit/cd789cb))



