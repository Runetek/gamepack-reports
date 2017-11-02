<template>
  <section class="section">
    <div class="field">
      <label for="revision" class="label">Revision</label>
      <div class="control">
        <div class="select">
          <select
            id="revision"
            name="revision"
            v-model="revision"
          >
            <option value="">Select a revision</option>
            <option
              v-for="rev in revisions"
              :value="rev"
              :key="rev"
            >
              {{ rev }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="field">
      <label for="report-type" class="label">Report Type</label>
      <div class="control">
        <div class="select">
          <select
            id="report-type"
            name="report-type"
            v-model="reportType"
          >
            <option value="">Select a report</option>
            <option
              v-for="report in reportTypes"
              :value="report"
              :key="report"
            >
              {{ shortName(report) }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <p v-if="reportType.startsWith('com.uniquepassive.osrsexploits')">
      View Source
      <a
        class="button is-small"
        target="_blank"
        href="https://github.com/UniquePassive/osrs-exploits"
      >
        <span class="icon">
          <i class="fa fa-github"></i>
        </span>
        <span>UniquePassive/osrs-exploits</span>
      </a>
    </p>
    <pre v-text="report"></pre>
  </section>
</template>

<script>
import Axios from 'axios'
import { parseString } from 'xml2js'
import { last, sortBy, uniq } from 'lodash'

const reports = Axios.create({
  baseURL: 'https://storage.runetek.io/reports'
})

export default {
  name: 'ReportViewer',
  props: {
    rt: String,
    rev: String
  },
  data () {
    return {
      keys: [],
      cache: {},
      loading: false,
      revision: this.$route.query.rev || '',
      reportType: this.$route.query.rt || '',
      report: ''
    }
  },
  computed: {
    revisions () {
      return sortBy(uniq(this.keys.map(x => x.split('/')[0])), x => +x)
    },
    reportTypes () {
      return uniq(this.keys.map(x => x.split('/')[1].replace(/\.txt$/, '')))
    },
    shortReportTypes () {
      return this.reportTypes.map(x => this.shortName(x))
    },
    reportPath () {
      const [rev, type] = [this.revision, this.reportType]
      if (rev === '' || type === '') {
        return ''
      }

      return `${rev}/${type}.txt`
    }
  },
  methods: {
    shortName (reportType) {
      return last(reportType.split('.'))
    },
    fetchReport () {
      const path = this.reportPath
      if (path) {
        reports.get(path)
          .then(({ data }) => {
            this.report = data
          })
      }
    }
  },
  mounted () {
    reports.get('/')
      .then(({ data }) => parseString(data, (err, xml) => {
        if (err) {
          throw err
        } else {
          this.keys = xml.ListBucketResult.Contents.map(x => x.Key[0])
          this.$nextTick(() => this.fetchReport())
        }
      }))
  },
  watch: {
    revision (rev) {
      this.fetchReport()
      if (rev !== '') {
        this.$router.push({
          name: 'reports',
          query: {
            ...this.$route.query,
            rev
          }
        })
      } else {
        delete this.$route.query['rev']
      }
    },
    reportType (rt) {
      this.fetchReport()
      if (rt !== '') {
        this.$router.push({
          name: 'reports',
          query: {
            ...this.$route.query,
            rt
          }
        })
      } else {
        delete this.$route.query['rt']
      }
    }
  }
}
</script>
